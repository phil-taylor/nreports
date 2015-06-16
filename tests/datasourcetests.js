var livejson = require('../lib/datasources/livejson');
var webjson = require('../lib/datasources/webjson');
var ReportParameter = require('../lib/parameter');

exports.testGetParameterizedUrlWithPathVariables = function(test) {
	test.expect(1);

	var params = [
		new ReportParameter("about", "string", "people"),
		new ReportParameter("me", "string", "phil")
	];

	var ds = new webjson("http://www.gooogle.com/:about/:me", params);

	test.equal(ds.getParameterizedUrl(), "http://www.gooogle.com/people/phil");
	test.done();
}

exports.testGetParameterizedUrlWithSearchVariables = function(test) {
	test.expect(1);

	var params = [
		new ReportParameter("about", "string", "people"),
		new ReportParameter("me", "string", "phil")
	];

	var ds = new webjson("http://www.gooogle.com?about=:about&who=:me", params);

	test.equal(ds.getParameterizedUrl(), "http://www.gooogle.com?about=people&who=phil");
	test.done();
}

exports.testGetParameterizedUrlWithPathAndSearchVariables = function(test) {
	test.expect(1);

	var params = [
		new ReportParameter("about", "string", "people"),
		new ReportParameter("me", "string", "phil"),
		new ReportParameter("limit", "number", 500)
	];

	var ds = new webjson("http://www.gooogle.com/:about/:me?limit=:limit", params);

	test.equal(ds.getParameterizedUrl(), "http://www.gooogle.com/people/phil?limit=500");
	test.done();
}

//

exports.testExecuteWebJson = function(test) {
	test.expect(3);

	var params = [
		new ReportParameter("address", "string", "Portland, OR")		
	];

	var ds = new webjson("http://maps.googleapis.com/maps/api/geocode/json?address=:address&sensor=false", params);

	ds.execute(function(err, data){

		test.ifError(err);
		test.ok(data != null);
		test.equal(data.status, "OK");

		test.done();
	});
	
}

exports.testExecuteLiveJson = function(test) {
	test.expect(3);

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

	var ds = new livejson(params, json);

	ds.execute(function(err, data){

		test.ifError(err);
		test.ok(data != null);
		test.ok(data.postalcodes != null);

		test.done();
	});
	
}

exports.testGetDatasourceUrlWithHostnameInConfig = function(test) {
	test.expect(1);

	var ds = new webjson("{googleHost}/:about/:me", null);

	test.equal(ds.getDatasourceUrl(), "http://www.gooogle.com/:about/:me");
	test.done();
}

exports.testGetDatasourceUrlWithHostnameInEnvironment = function(test) {
	test.expect(1);

	process.env.googleHostEnv = 'http://www.gooogle.com';

	var ds = new webjson("{googleHostEnv}/:about/:me", null);

	test.equal(ds.getDatasourceUrl(), "http://www.gooogle.com/:about/:me");
	test.done();
}