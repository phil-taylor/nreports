/**
 * Defines a reporting parameter used when calling your reporting datasource.
 * @param {String} name
 * @param {String} type
 * @param {Boolean|Number|String} value
 */
function ReportParameter(name, type, value) {
	
	this.parameterTypes = [
		"string",
		"number",
		"boolean",
		"datetime",
		"date",
		"time"
	];

	this.name = name;
	this.type = type;
	this.value = value;
	
	this.dependsOn = null; //use when you need cascading values

	this.label = null; // display label
	this.displayControl = null; // display control

}

ReportParameter.prototype = {
	
	Label: function(value) {
		this.label = value;
		return this;
	},

	DisplayControl: function(value) {
		this.displayControl = value;
		return this;
	},

	DependsOn: function(value) {
		this.dependsOn = value;
		return this;
	},

	Validate: function(){
		
		var valid = false;

		valid = (this.parameterTypes.indexOf(this.type) > -1)

		if (valid) {
			valid = this.ValidateDisplayControl();
		}

		return valid;
	},

	/* UI should subclass and override this behavior */
	ValidateDisplayControl: function() {
		return (!this.displayControl);
	},

	/* UI should subclass and override this behavior */
	ResolveDisplayControl: function() {
		return 'textbox';
	}	
}

ReportParameter.create = function(data) {
	var result = null;

	if (typeof data == 'string')
		data = JSON.parse(data);

	if (data instanceof Array) {
		 result = [];
		for(var i = 0; i < data.length; i++) {
			var param = data[i];
			
			result.push(new ReportParameter(param.name, param.type || 'string', param.value));
		}
	} else {

		result = new ReportParameter(data.name, data.type || 'string', data.value)
	}

	return result;
}

module.exports = ReportParameter;