// Set up arguments and usage.
var argv = require("optimist")
    .usage("Peak - Heights Compiler\n\nCompiles a .json file to JavaScript\nUsage: $0")
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
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;

// Define templates.
var variableAssignment = "var {name} = {value};\n";
var objectFunction = "{object}.prototype.{funcName} = function({params}) {\n" +
                     "{code}\n" +
                     "};\n\n";
var keyInput = "if (getKeyPressed(input) == \"{key}\") {\n" + 
               "{code}\n" + 
               "}\n";

/**
 * BEGIN MAIN CODE
 */
console.log("Peak.js v1.0.0 - Compile JSON heights sources to JavaScript");
console.log("Visit http://heightsjs.com for more information.");
console.log("Licenced under the MIT open source licence.\n");

if (process.argv[2] == null) {
  log.error("No source file specified.");
  process.exit(0);
}

// Read in file.
var file = __dirname + "/" + process.argv[2];

// Get start time for execution time evaluation.
var start = new Date();

// Default to file name if needed.
if (argv.o == "DEFAULT") {
  argv.o = process.argv[2].replace(".json", ".js");
}

// Read the input file and begin compilation.
fs.readFile(file, function(err, data) {
  if (err) throw err;
  compile(JSON.parse(data));
});

/**
 * BEGIN FUNCTION DEFINITIONS
 */

/**
 * Driver function for compilation.
 */
function compile(source) {
  log.info("Compiling...");
  var output = "";
  output += parseVariables(source);
  output += parseObjects(source);
  outputFile(output);
}


/**
 * Renders the template replacing the passed variables.
 */
function render(template, variables) {
  for (var replace in variables) {
    template = template.replace("{" + replace + "}", variables[replace]);
  }
  return template;
}


/**
 * Outputs the generated code to a file.
 */
function outputFile(code) {

  if (argv.m) {
    code = compress(code);
  }

  // Get execution time.
  var end = new Date();
  var time = (end - start) / 1000;
  log.info("Saving...");
  fs.writeFile(argv.o, code, function(err) {
    if(err) {
        log.error(err);
    } else {
        log.info("Compiled successfully in " + time + "s and written to " + argv.o);
    }
  });
}


/**
 * Compresses the passed in code using UglifyJS.
 */
function compress(orig_code) {
  log.info("Minifying...");
  var ast = jsp.parse(orig_code);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  return pro.gen_code(ast);
}


/**
 * Parses the variables.
 */
function parseVariables(source) {
  var genCode = "";
  for (var name in source.variables) {
    genCode += render(variableAssignment, {"name":name, "value":source.variables[name]});
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
    functions += render(objectFunction, {
        "object" : name,
        "funcName" : func,
        "params" : obj.functions[func][0],
        "code" : obj.functions[func][1]
    });
    /*functions += name + ".prototype." + func + " = function(" + obj.functions[func][0] + ") {\n";
    functions += obj.functions[func][1];
    functions += "\n};\n\n";*/
  }

  // Collisions.
  if (obj.hasOwnProperty("collisions")) {
    constructor += "collideable(this);\n";
    functions += parseCollisions(obj, name);
  }
  
  // Inputs.
  if (obj.hasOwnProperty("inputs")) {
    constructor += "inputHook(this);\n";
    functions += parseInputs(obj, name);
  }

  // Close out constructor.
  constructor += "\n};\n\n";

  var code = constructor + functions;
  return code;
}


/**
 * Parse collision evnets from objects.
 */
function parseCollisions(obj, name) {
  var genCode = "";
  var useElse = false;
  genCode = name + ".prototype.onCollision = function(other) {\n";

  // Loop through each collision.
  for (var collision in obj.collisions) {
    if (useElse) genCode += "else ";
    genCode += "if (other instanceof " + collision + ") {\n";
    genCode += obj.collisions[collision];
    genCode += "\n}\n";
    useElse = true;
  }

  genCode += "\n};\n\n";
  return genCode;
}


/**
 * Parses input events
 */
function parseInputs(obj, name) {
  var keyDowns = "if (getInputType(input) == \"keydown\") {\n";
  var keyUps = "if (getInputType(input) == \"keyup\") {\n";
  var mouseDowns = "if (getInputType(input) == \"mousedown\") {\n";
  var mouseUps = "if (getInputType(input) == \"mouseup\") {\n";
  var genCode = "";
  var useKeyDown = false;
  var useKeyUp = false;
  var useMouseDown = false;
  var useMouseUp = false;
  
  // Loop through each collision.
  for (var input in obj.inputs) {
    if (input == "keydown") {
      useKeyDown = true;
      keyDowns += render(keyInput, {"key" : obj.inputs[input][0], "code" : obj.inputs[input][1]});
    }
    if (input == "keyup") {
      useKeyUp = true;
      keyUps += render(keyInput, {"key" : obj.inputs[input][0], "code" : obj.inputs[input][1]});
    }
  }

  var genInputs = "";
  if (useKeyDown) {
    keyDowns += "\n}\n\n";
    genInputs += keyDowns;
  }  
  if (useKeyUp) {
    keyUps += "\n}\n\n";
    genInputs += keyUps;
  }
  
  genCode += render(objectFunction, {"object" : name, "funcName" : "handleInput",
                                     "params" : "input", "code" : genInputs});
  
  return genCode;
}
