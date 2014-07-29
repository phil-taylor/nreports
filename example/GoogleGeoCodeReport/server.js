var http = require('http');
var fs = require('fs');
var NReports = require('../../index'); // you would use "nreports"

var template = fs.readFileSync('./report.tmpl');

/*
  Example 1 - you can do it this way and pass both your report and datasource to the reporting engine.

var report = 
	new NReports.Report("GoogleGeoCode")
		.addParameter("address", "string", "111 SW 5th Ave, Portland, OR 97204")
		.setTemplate(template.toString());

var ds = new NReports.WebJsonDatasource("http://maps.googleapis.com/maps/api/geocode/json?address=:address&sensor=false", report.parameters);
*/

// Or you can describe your report and datasource using JSON, if you have a small template you can also define it directly in JSON
var report = new NReports.Report({
	name: 'GoogleGeoCode',
	parameters: [
		{ name: 'address', type: 'string', value: '111 SW 5th Ave, Portland, OR 97204'}
	],
	datasource: {
		name: 'WebJson',
		datasourceUrl: 'http://maps.googleapis.com/maps/api/geocode/json?address=:address&sensor=false'
	}
});

report.setTemplate(template.toString());

var engine = new NReports.ReportEngine();

engine.setRuntime(new NReports.HandlebarsRuntime());

http.createServer(function (req, res) {
  
	engine.render(report, function(err, html){

		if (err) {
			res.writeHead(500, {'Content-Type': 'text/html'});
  			res.end("<html><head><title>Application Error</title></head><body><h1>Application Error</h1><p>" + err.toString() + "</p></body></html>");
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'});
  			res.end(html);
		}

	});

}).listen(8080);