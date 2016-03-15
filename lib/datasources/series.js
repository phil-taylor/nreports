var _ = require('lodash');
var ReportDatasource = require('./datasource');
var ReportParameter = require('../parameter');

var async = require('async');

/**
 * Series allows you to supply a series of datasources your report depends on and an optional join function.
 * @class SeriesDatasource
 * @uses  ReportParameter
 * @param {Array} parameters
 * @param {Object} data
 * @example
 *
 *	var params = [
 new ReportParameter("postalcode", "string", "6600"),
 new ReportParameter("country", "string", "AT"),
 new ReportParameter("username", "string", "demo")
 ];

 var json = {
		"postalcodes":[
			{"adminCode3":"70805","adminName2":"Politischer Bezirk Reutte","adminName3":"Breitenwang","adminCode2":"708","postalcode":"6600","adminCode1":"07","countryCode":"AT","lng":10.7333333,"placeName":"Breitenwang","lat":47.4833333,"adminName1":"Tirol"},
			{"adminCode3":"70806","adminName2":"Politischer Bezirk Reutte","adminName3":"Ehenbichl","adminCode2":"708","postalcode":"6600","adminCode1":"07","countryCode":"AT","lng":10.7,"placeName":"Ehenbichl","lat":47.4666667,"adminName1":"Tirol"},
			{"adminCode3":"70820","adminName2":"Politischer Bezirk Reutte","adminName3":"Lechaschau","adminCode2":"708","postalcode":"6600","adminCode1":"07","countryCode":"AT","lng":10.7,"placeName":"Lechaschau","lat":47.4833333,"adminName1":"Tirol"}
			]
	};

 var live = new livejson(params, json);

 var web = new webjson("http://api.geonames.org/postalCodeLookupJSON?postalcode=:postalcode&country=:country&username=:username", params);

 var ds = new series(params, [live, web]);

 ds.execute(function(err, data){
		// process data or handle error here...
	});
 *
 */
function SeriesDatasource(parameters, sources) {
    this.name = 'Series';
    this.sources = [];
    this.selectors = null;

    if (parameters instanceof Object && !(parameters instanceof Array)) {

        // load from object def
        for(var property in parameters) {

            if (property == 'sources') {
                console.log('->sources');
                var sources = parameters[property];

                var new_sources = [];
                for(var ds in sources) {
                    new_sources.push(ReportDatasource.create(sources[ds]));
                }

                this[property] = new_sources;

            } else if (property == 'parameters') {
                this[property] = ReportParameter.create(parameters[property]);
            } else {
                this[property] = parameters[property];
            }
        }


    } else {
        this.sources = sources;
        ReportDatasource.call(this, parameters);
    }

}

SeriesDatasource.prototype = Object.create(SeriesDatasource.prototype);

/**
 * Add a datasource to this series
 * @param source
 * @returns {SeriesDatasource}
 */
SeriesDatasource.prototype.addSource = function addSource(source) {
    this.sources.push(source);
    return this;
}

/**
 * Provide a set of selectors to join the data, one selector per datasource is required. Support for the following
 * properties to be supplied on each selector:
 *   table: the name of the table that contains the data when your datasource returns an object (optional)
 *   key: the name of the field that should be used to join the data (required)
 *   transformer: a function that will select the data you wish to join (optional)
 * @param callback
 * @example
 *
 *    var sources = [
 *        {
 *          "result": [
 *                  {"id": 1, "name": "a"},
 *                  { "id": 2, "name": "b" }
 *              ]
 *         },
 *         [
 *           { "ID": 1, "city": "c" },
 *           { "ID": 2, "city": "d" }
 *         ]
 *    ];
 *
 *    var ds = new series(params, sources);
 *
 *    ds.setSelectors([
 *      { table: "result", key: "id" },
 *      { key: "ID", transformer: function(item){ return item.city; } }
 *    ]);
 *
 *    Will produce the following resultset:
 *
 *    [
 *      {"id": 1, "name": "a", "city": "c" },
 *      { "id": 2, "name": "b", "city": "d" }
 *    ]
 *
 */
SeriesDatasource.prototype.setSelectors = function(selectors) {
    this.selectors = selectors;
    return this;
}

/**
 * Execute the datasource and return the data thru a callback method.
 * @async
 * @method execute
 * @param  {Function} callback(err, data)
 */
SeriesDatasource.prototype.execute = function(callback){
    var _this = this;
    console.log('executing series ds...');
    console.log(_this);

    async.waterfall([
        function(cb) {
            async.map(_this.sources, function(source, done){

                source.parameters = _this.parameters;

                console.log('executing source -> ');
                // console.log(source);

                source.execute(function(err, data){
                    if (err) return done(err);

                    return done(null, data);
                });

            }, cb);
        },
        function(tables, cb) {

            var sorted = _.map(tables, function(table) {
                    var index = tables.indexOf(table);
                    var selector = _this.selectors[index];

                    return _.chain(table[selector.table])
                            .sortBy(selector.key)
                            .map(function(value) {
                                    return _.chain(value)
                                            .pick(value, selector.select)
                                            .mapKeys(function(v, k) { return selector.transformer[k] || k })
                                            .value()
                                })
                            .value();
                });

            cb(null, sorted);

        },
        function(sorted, cb) {

            var dataset = _.reduce(sorted, function(previous, current) {

                    if (!previous || previous.length === 0) return current;
                    if (!current || current.length === 0) return previous;

                    var index = sorted.indexOf(current);
                    var selector = _this.selectors[index];
                    var keys = _.map(current, selector.key);

                    return _.map(previous, function(value, key) {
                            var id = _.sortedIndexBy(keys, value[_this.selectors[0].key]);
                            return _.merge(value, current[id]);
                    });
                },
                []);

            cb(null, dataset);

        }],
        function(err, data) {
            callback(err, data);
        });


}

module.exports = SeriesDatasource;