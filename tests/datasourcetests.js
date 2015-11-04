var livejson = require('../lib/datasources/livejson');
var webjson = require('../lib/datasources/webjson');
var series = require('../lib/datasources/series');
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

exports.testExecuteSeriesNoSelectors = function(test) {
    test.expect(6);

    var params = [];

    var json1 = new livejson(params, [
        {"id": 1, "name": "James Smith"},
        {"id": 2, "name": "Will Farrel"}
    ]);

    var json2 = new livejson(params, [
        {"person_id": 2, "phone": "503-555-1212"},
        {"person_id": 1, "phone": "971-555-1313"}
    ]);

    var ds = new series(params, [json1, json2]);

    ds.execute(function(err, data){

        test.ifError(err);
        test.ok(data != null);
        test.ok(data instanceof Array);
        test.equal(data.length, 4);

        console.log(data[0]);
        test.equal(data[0].name, 'James Smith');

        console.log(data[3]);
        test.equal(data[3].phone, '971-555-1313');

        test.done();
    });

}

exports.testExecuteSeriesWithSelectors = function(test) {
    test.expect(7);

    var params = [];

    var json1 = new livejson(params, [
        {"id": 1, "name": "James Smith"},
        {"id": 2, "name": "Will Farrel"}
    ]);

    var json2 = new livejson(params, [
        {"person_id": 2, "phone": "503-555-1212"},
        {"person_id": 1, "phone": "971-555-1313"}
    ]);

    var ds = new series(params, [json1, json2]);
    ds.setSelectors([
        { key: "id" },
        { key: "person_id" }
    ]);

    ds.execute(function(err, data){

        test.ifError(err);
        test.ok(data != null);
        test.ok(data instanceof Array);
        test.equal(data.length, 2);

        test.equal(data[1].id, 2);
        test.equal(data[1].name, 'Will Farrel');
        test.equal(data[1].phone, '503-555-1212');

        console.log(data[1]);

        test.done();
    });

}

exports.testExecuteSeriesWithSelectorsAndTable = function(test) {
    test.expect(7);

    var params = [];

    var json1 = new livejson(params, {
        "status" : 200,
        "results" : [
        {"id": 1, "name": "James Smith"},
        {"id": 2, "name": "Will Farrel"}
        ]
    });

    var json2 = new livejson(params, [
        {"person_id": 2, "phone": "503-555-1212"},
        {"person_id": 1, "phone": "971-555-1313"}
    ]);

    var ds = new series(params, [json1, json2]);
    var ds = new series(params, [json1, json2]);
    ds.setSelectors([
        { key: "id", table: "results" },
        { key: "person_id" }
    ]);

    ds.execute(function(err, data){

        test.ifError(err);
        test.ok(data != null);
        test.ok(data instanceof Array);
        test.equal(data.length, 2);

        test.equal(data[1].id, 2);
        test.equal(data[1].name, 'Will Farrel');
        test.equal(data[1].phone, '503-555-1212');

        console.log(data[1]);

        test.done();
    });

}

exports.testExecuteSeriesWithSelectorsAndTableAndTransformer = function(test) {
    test.expect(8);

    var params = [];

    var json1 = new livejson(params, {
        "status" : 200,
        "results" : [
            {"id": 1, "name": "James Smith"},
            {"id": 2, "name": "Will Farrel"}
        ]
    });

    var json2 = new livejson(params, [
        {"person_id": 2, "phone": "503-555-1212"},
        {"person_id": 1, "phone": "971-555-1313"}
    ]);

    var ds = new series(params, [json1, json2]);
    var ds = new series(params, [json1, json2]);
    ds.setSelectors([
        { key: "id", table: "results" },
        { key: "person_id", transformer: function(item){ return { phone: item.phone }; } }
    ]);

    ds.execute(function(err, data){

        test.ifError(err);
        test.ok(data != null);
        test.ok(data instanceof Array);
        test.equal(data.length, 2);

        test.equal(data[1].id, 2);
        test.equal(data[1].name, 'Will Farrel');
        test.equal(data[1].phone, '503-555-1212');
        test.ok(data[1].person_id == null);

        console.log(data[1]);

        test.done();
    });

}