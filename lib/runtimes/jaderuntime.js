var Runtime = require('./runtime');
var Jade = require('jade');

function JadeRuntime(){
	Runtime.call(this, 'Jade');
}

JadeRuntime.prototype = Object.create(Runtime.prototype);

JadeRuntime.prototype.compile = function(template){
	return Jade.compile(template);
}

module.exports = JadeRuntime;