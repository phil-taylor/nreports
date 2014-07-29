function Pipeline(){	
}

Pipeline.prototype.render = function(content, next) {};

/**
 * Process all pipelines on the stack
 */
Pipeline.execute = function(stack, content, callback){
	
	var pipeline = stack.pop();

	var handle_response = function(err, result) {
		if (err) {
			callback(err);
		} else if (stack.length > 0) {
			pipline = stack.pop();
			console.log('Pipeline::render');
			pipeline.render(result, handle_response);
		} else {
			callback(null, result);
		}
	};
	
	console.log('Pipeline::render');
	pipeline.render(content, handle_response);

}

module.exports = Pipeline;