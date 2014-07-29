var fs = require('fs');
var Pipeline = require('./pipeline');
var PhantomJs = require('phantom');
var pdfEngine = new PhantonmJsPdf();

/**
 * [PdfPipeline The PDF pipeline will transform the content into a PDF file.]
 */
function PdfPipeline(){
	Pipeline.call(this);
}

PdfPipeline.prototype = Object.create(Pipeline.prototype);

PdfPipeline.prototype.render = function(content, next) {
	pdfEngine.render(content, next);	
};

/**
 * [PhantonmJsPdf the PDF processing engine.]
 */
function PhantonmJsPdf(){
	this.session = null;

	this.createToken = function () {
	    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
	        return v.toString(16);
	    });
	};
}

PhantonmJsPdf.prototype.render = function(content, callback) {
	
	var self = this;

	self.createSession(function(err, session){


		var page;

		try {
			session.createPage(function(newPage) {
				page = newPage;
				
				page.set('paperSize', { format: 'A4', orientation: 'landscape', border: '1cm' });

				page.set('onLoadFinished', function(status) {
  					console.log('::rendering');
  					var file = '/tmp/nreports-' + self.createToken() + '.pdf';
					page.render(file, function() {
						
						var data = fs.readFileSync(file);
						fs.unlinkSync(file);

						page.close();
						page = null;
						return callback(null, data);
					});
				});

				page.set('onError', function(msg, trace) {
				    var msgStack = ['ERROR: ' + msg];
				    if (trace && trace.length) {
				        msgStack.push('TRACE:');
				        trace.forEach(function(t) {
				            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
				        });
				    }
				    console.error(msgStack.join('\n'));
				    callback(new Error(msg));
				});				

				page.set('content',  content);

			});
		} catch(e) {
		
			try {
				if (page != null) {
					page.close(); // try close the page
				}
			} catch(e) {
					// ignore 
			}
			
			return callback(new Error('Exception rendering pdf:' + e.toString()));
		}
	});
};

PhantonmJsPdf.prototype.createSession = function(callback) {
  var self = this;
  if (self.session) {
    return callback(null, self.session);
  } else {
    PhantomJs.create({}, function(newSession) {
      self.session = newSession;

      process.on('exit', function(code, signal) {
  		self.session.exit();
	  });

      return callback(null, self.session);
    });
  }
};

module.exports = PdfPipeline;