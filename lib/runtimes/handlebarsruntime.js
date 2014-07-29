var Runtime = require('./runtime');
var Handlebars = require('handlebars');
var dateFormatting = require('./dateformat');

function HandlebarsRuntime(){
	Runtime.call(this, 'Handlebars');	
	dateFormatting();
	addHelpers();
}

HandlebarsRuntime.prototype = Object.create(Runtime.prototype);

HandlebarsRuntime.prototype.compile = function(template){
	return Handlebars.compile(template);		
}

function addHelpers() {
	Handlebars.registerHelper("parameter", function(name) {
		var param = this.parameters.filter(function(item){			
			console.log(typeof item.name);
			return item.name === name;
		});

		if (param) {
			return param[0].value;
		} else {
			return "";
		}
	});

	// PHP style date format strings
	Handlebars.registerHelper("formatDate", function(value, fmt) {
		console.log('[Handlehbars Helper formatDate]');

		var finalFormat = "m/d/Y";

		if (typeof fmt === 'string') {
			finalFormat = fmt;
		}


		var output = "";

		console.log('value ->');
		console.log(value);

		console.log('format ->');
		console.log(fmt);

		console.log('finalFormat ->');
		console.log(finalFormat);

		if (value) {
			
			var date = null;

			if (typeof value === 'string') {
				
				var tmp = value;

				if (value.match(/\d\d\d\d\-\d\d\-\d\d/))
					tmp = value.substring(5,7) + '/' + value.substring(8,10) + '/' + value.substring(0,4);

				console.log(tmp);

				date = new Date(tmp);				

			} else if (value instanceof Date) {
				date = value;
			}

			if (date) {
				output = date.format(finalFormat);
			}

			console.log('date ->');
			console.log(date);

			console.log('output ->');
			console.log(output);
		}

		return output;		
	});

}


module.exports = HandlebarsRuntime;