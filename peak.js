// Set up arguments and usage.
var argv = require("optimist")
    .usage("Peak - Heights Compiler\n\nCompiles a .json file to JavaScript\nUsage: $0")
    .demand(["s"])
    .alias('s', 'src')
    .describe('s', "The .json file to compile")
    .alias('o', 'out')
    .default('o', "DEFAULT")
    .describe('o', "Output filename")
    .alias('m', 'min')
    .describe('m', "Minify compiled JS")
    .alias('f', 'full')
    .describe('f', "Compile to complete single JS file including engine code")
    .argv;
    
// More imports.
var fs = require("fs");
var log = require("winston");

// Read in file.
var file = __dirname + "/" + argv.s;

// Get start time for execution time evaluation.
var start = new Date();

// Default to file name if needed.
if (argv.o == "DEFAULT") {
  argv.o = argv.s.replace(".json", ".js"); 
}

// Read the input file and begin compilation.
fs.readFile(file, function(err, data) {
  if (err) throw err;
  compile(JSON.parse(data));
});


/**
 * Driver function for compilation.
 */
function compile(source) {
  var output = "";
  output += parseVariables(source);
  output += parseObjects(source);
  outputFile(output);
}


/**
 * Outputs the generated code to a file.
 */
function outputFile(code) {
  
  // Get execution time.
  var end = new Date();
  var time = (end - start) / 1000;
  
  fs.writeFile(argv.o, code, function(err) {
    if(err) {
        log.error(err);
    } else {
        log.info("Compiled successfully in " + time + "s and written to " + argv.o);
    }
  }); 
}


/**
 * Parses the variables.
 */
function parseVariables(source) {
  var genCode = "";
  for (var name in source.variables) {
    genCode += "var " + name + " = " + source.variables[name] + ";\n";
  }
  genCode += "\n\n";
  return genCode;
}


/**
 * Controlling function for object parsing.
 */
function parseObjects(source) {
  var genCode = "";
  for (var obj in source.objects) {
    genCode += parseObject(source.objects[obj], obj);
  }
  return genCode;
}


/**
 * Parses a single object.
 */
function parseObject(obj, name) {
  
  // Initialize parts to fill out.
  var functions = "";
  var constructor = "";
  
  // Check that the constructor exists.
  if (!obj.hasOwnProperty("constructor")) {
    log.error("Error in compiling object " + name + ": No constructor found.");
    process.exit(0);
  }
  
  // Begin generation of constructor. We leave it open to add more to it if needed.
  constructor += "var " + name + " = function(x, y, id, params) {\n";
  constructor += obj.constructor;
  
  // Loop through functions.
  for (var func in obj.functions) {
    functions += name + ".prototype." + func + " = function(" + obj.functions[func][0] + ") {\n";
    functions += obj.functions[func][1];
    functions += "\n};\n\n";
  }
  
  // Close out constructor.
  constructor += "\n};\n\n";
  
  var code = constructor + functions;
  return code;
}
