# Peak
A compiler for Heights

## What?

Peak is a system to take standardized JSON source files and generate full JavaScript files for the Heights game engine. Peak can minify and optimize the code, as well as include the Heights engine for a complete file which you can simply drop into a webpage.

Peak source files are not intended to be written directly, though it is entirely possible. The idea for Peak is to provide automation for code generation from an easily manipulatable standard, allowing applications to help generate Heights games. See the source spec further down in this README.

**NOTE: Peak is still in early, rapid development and is not intended for commercial use quite yet!**

## Usage
`node peak SOURCEFILE`

## Options
`-o, --out` Specify the output filename.
`-m, --min` Minify the output code.
`-f, --full` Include the Heights engine in the output file.

## Sourcefule spec
**NOTE: Peak is still in early development, this spec is NOT complete.**
```javascript
{
  "variables" : {
    "VARIABLE_NAME" : "VARIABLE_VALUE"
  },
  "objects" : {
    "OBJECT_NAME" : {
      "constructor" : "CONSTRUCTOR_CODE",
      "functions" : {
        "FUNCTION_NAME" : [
          "FUNCTION_ARGUMENTS",
          "FUNCTION_CODE"
        ]
      },
      "collisions" : {
        "OTHER_OBJECT" : "COLLISION_CODE"
      },
      "inputs" : {
        // For keyboad events
        "INPUT_EVENT_TYPE" : ["KEY", "CODE_TO_RUN"],
        // For mouse events
        "INPUT_EVENT_TYPE" : "CODE_TO_RUN",
      }
    }
  }
}
```
