var argv = require("optimist")
    .usage("Peak - Heights Compiler\n\nCompiles a .json file to JavaScript\nUsage: $0")
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
  var output = "";
  output += parseVariables(source);
  output += parseObjects(source);
  console.log(output);
}

function parseVariables(source) {
  var genCode = "";
  for (var name in source.variables) {
    genCode += "var " + name + " = " + source.variables[name] + ";\n";
  }
  genCode += "\n\n";
  return genCode;
}

function parseObjects(source) {
  var genCode = "";
  for (var obj in source.objects) {
    genCode += parseObject(source.objects[obj], obj);
  }
  return genCode;
}

function parseObject(obj, name) {
  var genCode = "";
  for (var func in obj) {
    if (func == "constructor") {
      genCode += "var " + name + " = function(x, y, id, params) {\n";
      genCode += obj[func];
    } else {
      genCode += name + ".prototype." + func + " = function(" + obj[func][0] + ") {\n";
      genCode += obj[func][1];
    }
    genCode += "\n};\n\n";
    
  }
  return genCode;
}