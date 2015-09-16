/**
 * The base class for all reporting data sources.
 * @class ReportDatasource
 * @param {Array} parameters
 */
function ReportDatasource(parameters) {
	this.parameters = parameters;
}

/**
 * Get a parameter from the array using the parameter name
 * @method  getParameter
 * @param  {String} name
 * @return {ReportParameter}
 */
ReportDatasource.prototype.getParameter = function(name) {
		console.log("getParameter( " + name + " )");

		var found =
			this.parameters.filter(function(item){
				return item.name == name;
			});

		return (found) ? found.shift() : null;
};

/**
 * Execute the data source and return the result using the callback provided.
 * @async
 * @method execute
 * @param  {Function} callback(err,data)
 */
ReportDatasource.prototype.execute = function(callback) {}


/**
 * [create factory method to create typed data source from JSON or object]
 * @param  {[type]} source the json or object to create datasource from
 * @return {[type]}        [description]
 */
ReportDatasource.create = function(source) {
	var obj = source;
	if (typeof source == 'string') {
		obj = JSON.parse(source);
	}

	var ds = null;
	var LiveJson = require('./livejson');
	var WebJson = require('./webjson');
    var Series = require('./series');

	switch(obj.name) {
		case 'LiveJson':
			ds = new LiveJson(obj);
			break;
		case 'WebJson':
			ds = new WebJson(obj);
			break;
        case 'Series':
            ds = new Series(obj);
            break;
	}

	return ds;
}


module.exports = ReportDatasource;