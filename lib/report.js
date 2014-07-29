var ReportParameter = require('./parameter');
var DataSource = require('./datasources/datasource');

/**
 * Defines everything needed to generate a report (name, parameters, template, datasource)
 * @class Report
 * @uses ReportParameter a parameter used to execute the report
 * @param {String} name
 */
function Report(source){
	this.name = null;
	this.parameters = [];
	this.template = null;
	this.datasource = null;

	if (typeof source == 'object') {
		console.log('setting report from object...');
		for(var property in source) {			
			console.log('property -> (' + property + ') == ' + typeof source[property]);
			console.log(source[property]); 
			if (property == 'datasource') {
				this[property] = DataSource.create(source[property]);
			} else if (property == 'parameters') {
				this[property] = ReportParameter.create(source[property]);
			} else {
				this[property] = source[property];	
			}		

		}
	} else {
		this.name = source;
	}

	console.log('report initialized ==>');
	console.log(this);
}

/**
 * Adds a parameter to the report.
 * @chainable
 * @method addParameter
 * @param {String} name
 * @param {String} type
 * @param {Boolean|Number|String} value
 */
Report.prototype.addParameter = function(name, type, value) {
		this.parameters.push(new ReportParameter(name, type, value));
		return this;
};

Report.prototype.setParameter = function(name, value) {
		console.log("Report.setParameter(" + name + ", " + value + ") ->");
		for(var i = 0; i < this.parameters.length; i++) {
			var item = this.parameters[i];
			
			if (item.name == name) {
				console.log('**** found, setting parameter value ****');
				item.value = value;
				break;
			}	
		}		

		return this;
};


/**
 * Used to set the reporting template for this report.
 * @chainable
 * @method setTemplate
 * @param {String} template
 */
Report.prototype.setTemplate = function(template) {
		this.template = template;
		return this;
};

/**
 * Used to set the report datasource for this report.
 * @chainable
 * @param {ReportDatasource} datasource
 */
Report.prototype.setDatasource = function(datasource) {
		this.datasource = datasource;
		return this;
};

/**
 * [getDatasource get the datasource and automatically bind the report parameters to it]
 * @return {[type]} [description]
 */
Report.prototype.getDatasource = function() {
		this.datasource.parameters = this.parameters;
		return this.datasource;
};


module.exports = Report;