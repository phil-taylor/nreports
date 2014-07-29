# NReports
-------------

A simple nodejs reporting framework that leverages template runtimes for report generation. 

## Features
* Template Runtimes
	+ Jade
	+ Handlebars
* Datasources
	+ LiveJSON - JSON data embedded in the datasource
	+ WebJSON - JSON data provided by a RESTful web service	
* Parameters
	+ Type - string, boolean, number
	+ Passed to the datasource for filtering. e.g. http://someurl?param1=:param1&param2=:param2

## Limitations
Currently the framework is only designed to work with JSON data and supports Jade or Handlebars templates.

## Sample Overview
The sample illustrates using the NReports reporting engine to build a report using the a handlebars template.

## Sample LiveJson datasource
```javascript
var NReports = require('nreports');

var params = [
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

var ds = new NReports.LiveJsonDatasource(params, json);

```

## Sample Template
```javascript
var NReports = require('nreports');

var template = '<h1>Sample Report</h1><ul>{{#each postalcodes}}<li>{{placeName}}</li>{{/each}}</ul><h3>Report Footer here...</h3>';

```

## Rendering the report
```javascript
var NReports = require('nreports');


var rpt = 
	new Report("sample")
		.addParameter("postalcode", "string", "6600")
		.addParameter("country", "string", "AT")
		.addParameter("username", "string", "demo")
		.setTemplate(template); // given the sample template above

var ds = new NReports.LiveJsonDatasource(rpt.parameters, json); // given the JSON from the sample datasource above

var engine = new NReports.ReportEngine();

engine.setRuntime(new NReports.HandleBarsRuntime());

engine.render(rpt, ds, function(err, html){

	if (err) console.error(err);		

	console.log(html);
});

```