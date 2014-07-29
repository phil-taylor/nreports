var ReportDatasource = require('./datasource');
var http = require('http');
var url = require('url');

/**
 * Datasource that allows you to supply a RESTfull endpoint that returns a JSON dataset.  You
 * supply the parametes in the URL by using a ':' prefix.  The URL syntax support both RESTfull 
 * url schemes and query string schemes.
 * @class WebJsonDatasource
 * @uses  ReportParameter
 * @param {String} datasourceUrl
 * @param {Array} parameters
 * @example
 * 
 * var params = [
		new ReportParameter("postalcode", "string", "6600"),
		new ReportParameter("country", "string", "AT"),
		new ReportParameter("username", "string", "demo")
	];

	var ds = new webjson("http://api.geonames.org/postalCodeLookupJSON?postalcode=:postalcode&country=:country&username=:username", params);

	ds.execute(function(err, data){
		// process data or handle error here...
	});
 */
function WebJsonDatasource(datasourceUrl, parameters) {
	this.name = 'WebJson';
	
	if (typeof datasourceUrl == 'string') {		
		this.datasourceUrl = datasourceUrl;
		ReportDatasource.call(this, parameters);
	} else {
		// load from object def
		for(var property in datasourceUrl) {			
			this[property] = datasourceUrl[property];
		}
	}
}

WebJsonDatasource.prototype = Object.create(ReportDatasource.prototype);

/*
*  Get a parameterized Url. Parameter names should be supplied as :paramname
*/
WebJsonDatasource.prototype.getParameterizedUrl =
	function() {
		var self = this;

		console.log("getParameterizedUrl -> " + self.datasourceUrl);

		var parsed = url.parse(this.datasourceUrl);

		// set path parameters
		if (parsed.pathname && parsed.pathname != "/") {
			var pathParams = parsed.pathname.split("/");
			var pathOut = "";

			pathParams.forEach(function(item){
				console.log(item);
				if (item.match(/^:.*/)) {

					var param = self.getParameter(item.slice(1));
					pathOut += param.value + "/";

				} else {
					pathOut += item + "/";	
				}

			});
			parsed.pathname = pathOut.slice(0,-1);
		} else {
			delete parsed.pathname;
		}


		// set query string parameters
		if (parsed.search) {
			var query = parsed.search.slice(1);
			var queryParams = query.split("&");
			var queryOut = "?";

			queryParams.forEach(function(item){
				var args = item.split("=");
				if (args[1].match(/^:.*/)) {
					var param = self.getParameter(args[1].slice(1));
					args[1] = param.value;
				}
				queryOut += args.join("=") + "&";
			});
			parsed.search = queryOut.slice(0,-1);
		}

		delete parsed.path;
		delete parsed.href;

		return url.format(parsed);

};

WebJsonDatasource.prototype.download = function(callback) {
		
		var finalUrl = this.getParameterizedUrl();

		// download data 
		console.log("Downloading data source from: " + finalUrl);
				
		var urlInfo = url.parse(finalUrl);

		var options = {
				  host: urlInfo.hostname,
				  path: urlInfo.path,
				  port: urlInfo.port,
				  auth: urlInfo.auth,
				  method: this.method
				};
		
		http_callback = function(response) {
					
				  console.log('Download STATUS (' + response.statusCode + ')');
			
				  response.on('error', function(err) {
					  console.log('Download Error - > problem with request: ' + e.message);
					  callback(err) 
				  });
			
				  var str = '';
				  response.on('data', function (chunk) {
				    str += chunk;
				  });

				  response.on('end', function () {
				    console.log(str);				    
				    callback(null, JSON.parse(str));
				  });
		};
		
		var request = http.get(options, http_callback);
};

/**
 * Execute the datasource and return the data thru a callback method.
 * @async
 * @method execute
 * @param  {Function} callback(err, data)
 */
WebJsonDatasource.prototype.execute = function(callback){
	this.download(callback);
}

module.exports = WebJsonDatasource;