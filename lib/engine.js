var async = require('async');
var Pipeline = require('./pipelines/pipeline')

/**
 * The reporting engine, responsible for tying everthing together and rendering the report.  Generally
 * render will run throug the folling phases.
 * 	  I.	Execute datasource
 * 	 II.	Compile template(s)
 * 	III.	Bind datasource output and render report using template(s)
 * @class ReportEngine
 * @uses Report defines the report name, parameters, datasource and template.
 * @uses ReportDatasource the report datasource to use for execution.
 */
function ReportEngine(){
	this.runtime = null;
	this.pipelines = [];
}

/**
 * [setRuntime Set the runtime for report generation.]
 * @param {[Runtime]} runtime the runtime template engine for report generation (Jade, Handlebars, etc).
 */
ReportEngine.prototype.setRuntime = function(runtime){
	this.runtime = runtime;
	return this;
}

/**
 * [addPipeline Add a processing pipline to the engine.]
 * @param {[type]} pipeline [description]
 */
ReportEngine.prototype.addPipeline = function(pipeline) {
	this.pipelines.push(pipeline);
	return this;
}

/**
 * Render the report inline and return the response thru a callback.
 * @async
 * @method render
 * @param  {Report}   report
 * @param  {ReportDatasource}   datasource
 * @param  {Function} callback(err, html)
 */
ReportEngine.prototype.render = function(report, datasource, callback){
		var self = this;

		// juggle parameters
		if (typeof datasource == 'function') {
			callback = datasource;
			datasource = report.getDatasource();
		}

		async.parallel({
			
			data: 
				function(cb) {
					console.log('Downloading datasource...');

					// execute data source
					datasource.execute(function(e, data){
						if (e) {
							console.error(e);
							cb(e);
						}
						cb(null, data);
					});
				},

			engine:
				function(cb){
					console.log('Compiling templates...');

					// compile template
					var runtime = self.compile(report);
					
					if (typeof runtime == 'Error') 
						cb(runtime);
					else
						cb(null, runtime);
				}
			},

			function(err, results){
				// execute the report

				if (err) {
					console.error(err);
					callback(err);
				}
				
				console.log('Executing report...');
				console.log(results);

				var locals = results.data;
				locals.parameters = report.parameters;

				console.log('with locals ->');
				console.log(locals);

				var html = results.engine(locals);
				
				console.log('*** ENGINE OUTPUT ***');
				console.log(html.length + ' BYTES');


				if (self.pipelines.length > 0) {
					console.log('*** POST TEMPLATE PIPELINE PROCESSING ***');
					Pipeline.execute(self.pipelines.slice(0), html, function(err, result){
						if (err) {
							console.error(err);
							callback(err);
						} else {
							console.log('*** PIPELINE PROCESSING OUTPUT ***');	
							console.log(result);
							callback(null, result);
						}
					})
				} else {
					callback(null, html);	
				}

		});
		
};

/**
 * Render the report to the file system.
 * @async
 * @method renderToFS
 * @param  {Report}   report
 * @param  {ReportDatasource}   datasource
 * @param  {String} destination the full location and filename to use when writing the report
 * @param  {Function} callback(err, html)
 */
ReportEngine.prototype.renderToFS = function(report, datasource, destination, callback) {
		var self = this;
		var fs = require('fs');

		self.render(report, datasource, function(err, html){

			if (err) {
				console.error(err);
				callback(err);
			}

			fs.writeFile(destination, html, function(e){

				if (e) {
					console.error(e);
					callback(e);
				}

				callback(null);
			});
		});

};

/**
 * Compile the reporting templates
 * @method compile
 * @param  {Report} report
 * @return {Function} the Handlebars execution pipeline
 */
ReportEngine.prototype.compile = function(report) {

	if (!this.runtime){
		throw new Error('Please set the runtime before calling compile.');
	}
	else {
		// for now it is a simple impl, when we add header, footer and detail templates it will be more complex			
		return this.runtime.compile(report.template);		
	}
};

module.exports = ReportEngine;