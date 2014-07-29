var Pipeline = require('./pipeline');

/**
 * [DirectPipeline The default "pass-through" pipeline. The content is unchanged when using this pipeline.]
 */
function DirectPipeline(){
	Pipeline.call(this);
}

DirectPipeline.prototype = Object.create(Pipeline.prototype);

DirectPipeline.prototype.render = function(content, next) {
	next(null, content);
};

module.exports = DirectPipeline;