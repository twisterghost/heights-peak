var argv = require("optimist")
    .usage("Compiles a .json file to JavaScript\nUsage: $0")
    .demand(["s"])
    .alias('s', 'src')
    .describe('s', "The .json file to compile")
    .alias('o', 'out')
    .describe('o', "Output filename")
    .alias('m', 'min')
    .describe('m', "Minify compiled JS")
    .alias('f', 'full')
    .describe('f', "Compile to complete single JS file including engine code")
    .argv;
var fs = require("fs");

// Read in file
var file = __dirname + "/" + argv.s;

fs.readFile(file, function(err, data) {
  if (err) throw err;

  compile(JSON.parse(data));
});

function compile(source) {
  console.log(source.hello);
}
