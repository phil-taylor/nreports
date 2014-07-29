var LiveJson = require('../lib/datasources/livejson');
var Parameter = require('../lib/parameter');
var Report = require('../lib/report');
var Engine = require('../lib/engine');
var JadeRuntime = require('../lib/runtimes/jaderuntime');
var HandlebarsRuntime = require('../lib/runtimes/handlebarsruntime');

var fs = require('fs');

exports.testLiveJsonReportExecutionJadeRuntime = function(test) {
	test.expect(2);
	
	var template = fs.readFileSync('./sample.jade');

	var rpt = 
		new Report("sample")
			.addParameter("postalcode", "string", "6600")
			.addParameter("country", "string", "AT")
			.addParameter("username", "string", "demo")
			.setTemplate(template);

	var json = {
		"postalcodes":[
			{"adminCode3":"70805","adminName2":"Politischer Bezirk Reutte","adminName3":"Breitenwang","adminCode2":"708","postalcode":"6600","adminCode1":"07","countryCode":"AT","lng":10.7333333,"placeName":"Breitenwang","lat":47.4833333,"adminName1":"Tirol"},
			{"adminCode3":"70806","adminName2":"Politischer Bezirk Reutte","adminName3":"Ehenbichl","adminCode2":"708","postalcode":"6600","adminCode1":"07","countryCode":"AT","lng":10.7,"placeName":"Ehenbichl","lat":47.4666667,"adminName1":"Tirol"},
			{"adminCode3":"70820","adminName2":"Politischer Bezirk Reutte","adminName3":"Lechaschau","adminCode2":"708","postalcode":"6600","adminCode1":"07","countryCode":"AT","lng":10.7,"placeName":"Lechaschau","lat":47.4833333,"adminName1":"Tirol"}
			]
	};

	var ds = new LiveJson(rpt.parameters, json);

	var engine = new Engine();

	engine.setRuntime(new JadeRuntime());

	engine.render(rpt, ds, function(err, html){

		if (err) console.error(err);		

		test.ifError(err);
		test.ok(html != null);

		test.done();
	});
}

exports.testLiveJsonReportExecutionHandlebarsRuntime = function(test) {
	test.expect(2);
	
	var template = fs.readFileSync('./sample.handlebars');

	var rpt = 
		new Report("sample")
			.addParameter("postalcode", "string", "6600")
			.addParameter("country", "string", "AT")
			.addParameter("username", "string", "demo")
			.setTemplate(template.toString());

	var json = {
		"postalcodes":[
			{"adminCode3":"70805","adminName2":"Politischer Bezirk Reutte","adminName3":"Breitenwang","adminCode2":"708","postalcode":"6600","adminCode1":"07","countryCode":"AT","lng":10.7333333,"placeName":"Breitenwang","lat":47.4833333,"adminName1":"Tirol"},
			{"adminCode3":"70806","adminName2":"Politischer Bezirk Reutte","adminName3":"Ehenbichl","adminCode2":"708","postalcode":"6600","adminCode1":"07","countryCode":"AT","lng":10.7,"placeName":"Ehenbichl","lat":47.4666667,"adminName1":"Tirol"},
			{"adminCode3":"70820","adminName2":"Politischer Bezirk Reutte","adminName3":"Lechaschau","adminCode2":"708","postalcode":"6600","adminCode1":"07","countryCode":"AT","lng":10.7,"placeName":"Lechaschau","lat":47.4833333,"adminName1":"Tirol"}
			]
	};

	var ds = new LiveJson(rpt.parameters, json);

	var engine = new Engine();

	engine.setRuntime(new HandlebarsRuntime());


	engine.render(rpt, ds, function(err, html){

		if (err) console.error(err);		

		test.ifError(err);
		test.ok(html != null);

		test.done();
	});
}