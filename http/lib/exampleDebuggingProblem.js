/*
 * Library that demonstrates something throwing when it's init() is called
 *
 */

// Container for module (to be exported)
const example = {};

// Init function
example.init = function(){
  // This is an error created intentionally (bar is not defined)
  const foo = bar;
};

// Export the module
module.exports = example;