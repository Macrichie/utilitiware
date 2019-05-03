/*
* Primary file for the API
* 
*/

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');


// Declare the app
const app = {};

//Init function
app.init = function() {
    // Start server
    server.init();

    // Start the workers
    workers.init();

    // Start the CLI, but make sure it starts late
    setTimeout(function() {
        cli.init();
    }, 50);
};

//Execute the app
app.init();

//Export the app
module.exports = app;