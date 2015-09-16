var ReportDatasource = require('./datasource');

function MultipleDatasource(parameters, data) {
    this.name = 'Series';

    if (parameters instanceof Array) {
        this.data = data;
        ReportDatasource.call(this, parameters);
    } else {
        // load from object def
        for(var property in parameters) {
            this[property] = parameters[property];
        }
    }
}

MultipleDatasource.prototype = Object.create(MultipleDatasource.prototype);

/**
 * Execute the datasource and return the data thru a callback method.
 * @async
 * @method execute
 * @param  {Function} callback(err, data)
 */
MultipleDatasource.prototype.execute = function(callback){
    callback(null, this.data);
}

module.exports = MultipleDatasource;