var ReportDatasource = require('./datasource');
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
            this[property] = parameters[property];
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
 * Internal function to join object arrays on key values
 * @param lookupTable
 * @param mainTable
 * @param lookupKey
 * @param mainKey
 * @param select
 * @returns {Array}
 */
var join = function join(lookupTable, mainTable, lookupKey, mainKey, select) {
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = [],
        output = [];
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        lookupIndex[row[lookupKey]] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
};

var merge = function merge(a, b) {

    a = a || {};
    b = b || {};

    for(var property in b){
        a[property] = b[property];
    }
    return a;

};

/**
 * Execute the datasource and return the data thru a callback method.
 * @async
 * @method execute
 * @param  {Function} callback(err, data)
 */
SeriesDatasource.prototype.execute = function(callback){
    var _this = this;
    console.log('executing series ds...');

    async.waterfall([
        function(cb) {
            async.map(_this.sources, function(source, done){

//                console.log('executing source -> ');
//                console.log(source);

                source.execute(function(err, data){
                    if (err){
                        return done(err);
                    } else {
                        return done(null, data);
                    }
                });

            }, cb);
        },
        function(data, cb) {
            if (_this.selectors && data && data instanceof Array) {

                var final = data.reduce(function(a, b, index){
                    var tableA = a, tableB = b;
                    var selectorA = (index - 1 > -1) ? _this.selectors[index-1] : {};
                    var selectorB = (index > -1) ? _this.selectors[index] : {};

                    console.log('------ A --------');
                    console.log(a);
                    console.log(selectorA);
                    console.log();

                    console.log('------ B --------');
                    console.log(b);
                    console.log(selectorB);
                    console.log();

                    if (selectorA.table) {
                        tableA = a[selectorA.table] || a;
                    }

                    if (selectorB.table) {
                        tableB = b[selectorB.table] || b;
                    }

                    return join(tableA, tableB, selectorA.key, selectorB.key, function(b, a){

                        var valueA = (selectorA.transformer) ? selectorA.transformer(a) : a;
                        var valueB = (selectorB.transformer) ? selectorB.transformer(b) : b;

                        console.log('----- join A ------');
                        console.log(valueA);

                        console.log('----- join B ------');
                        console.log(valueB);

                        return merge(valueA,valueB);
                    });
                }, []);

                cb(null, final);


            } else if (data && data instanceof Array) {

                var final = data.reduce(function(a, b){
                    return a.concat(b);
                }, []);

                cb(null, final);

            } else {

                    cb(null, data);
            }

        }
        ],
        function(err, data) {
            callback(err, data);
        });


}

module.exports = SeriesDatasource;