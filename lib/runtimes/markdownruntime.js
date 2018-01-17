var Runtime = require('./runtime');
var HandlebarsRuntime = require('./handlebarsruntime');
var Markdown = require( "markdown" ).markdown;

function MarkdownRuntime(){
    Runtime.call(this, 'Markdown');
    this.handlebarsRuntime = new HandlebarsRuntime();
}

MarkdownRuntime.prototype = Object.create(Runtime.prototype);

MarkdownRuntime.prototype.compile = function(template){

    // (1) Run template through the markdown translator
    const interpolated = this.handlebarsRuntime.compile(template);

    // (2) Compile interpolated template using handlebars
    return (data) => {
        const transformed = interpolated(data);
        console.log("**TRANSFORMED**");
        console.log(transformed);

        const html = Markdown.toHTML(transformed, 'Maruku');
        console.log("**HTML**");
        console.log(html);

        return html;
    };
}

module.exports = MarkdownRuntime;