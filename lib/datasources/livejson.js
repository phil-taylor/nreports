var ReportDatasource = require('./datasource');
var http = require('http');
var url = require('url');

/**
 * Datasource that allows you to supply a JSON dataset as part of the datasource definition.  Great
 * for testing or when a report should cache it's own data.
 * @class LiveJsonDatasource
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

	var ds = new livejson(params, json);

	ds.execute(function(err, data){
		// process data or handle error here...
	});
 * 
 */
function LiveJsonDatasource(parameters, data) {
	this.name = 'LiveJson';
	
	if (parameters instanceof Array) {		
		this.data = data;
		ReportDatasource.call(this, parameters);	
	} else {
		// load from object def
		for(var property in parameters) {			
			this[property] = parameters[property];
		}
	}
}

LiveJsonDatasource.prototype = Object.create(ReportDatasource.prototype);

/**
 * Execute the datasource and return the data thru a callback method.
 * @async
 * @method execute
 * @param  {Function} callback(err, data)
 */
LiveJsonDatasource.prototype.execute = function(callback){
	callback(null, this.data);
}

module.exports = LiveJsonDatasource;