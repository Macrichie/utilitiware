/*
* Primary file for the API
* 
*/

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const exampleDebugginProblem = require('./lib/exampleDebuggingProblem');


// Declare the app
const app = {};

//Init function
app.init = function() {
    debugger;
    // Start server
    server.init();
    debugger;

    // Start the workers
    debugger;
    workers.init();
    debugger;

    // Start the CLI, but make sure it starts late
    debugger;
    setTimeout(function() {
        cli.init();
        debugger;
    }, 50);
    debugger;

    // Set foo at 1
    debugger;
    let foo = 1;
    console.log('Set foo to 1');
    debugger;

    // Increment foo by 1
    foo++;
    console.log('Increment foo by 1');
    debugger;

    // Square foo
    foo = foo * foo;
    console.log('Square foo');
    debugger;

    // Covert foo to a string
    foo = foo.toString();
    console.log('Convert foo to a string');
    debugger;

    // Call the init script that will throw
    exampleDebugginProblem.init();
    console.log('Just called the library');
    debugger;
};

//Execute the app
app.init();

//Export the app
module.exports = app;