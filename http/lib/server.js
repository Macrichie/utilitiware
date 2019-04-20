/*
* These are server related tasks
* 
*/

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');


// Instantiate the server module object
const server = {};

//instantiating http server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

//instantiating https server
server.httpsServerOptions = {
    'key':fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
}

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
});

server.unifiedServer = (req, res) => {
    //Get the url and parse it
    const parseUrl = url.parse(req.url, true);
    //Get the path
    const pathName = parseUrl.pathname;
    const trimmedPath = pathName.replace(/^\/+|\/+$/g, '');

    const queryString = parseUrl.query;
    //Get HTTP request
    const method = req.method.toLocaleLowerCase();

    const headers = req.headers;

    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', data => {
        buffer += decoder.write(data);
    });
    req.on('end', ()=> {
        buffer += decoder.end();

        const routeToHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        const data = {
            'trimmedPath' : trimmedPath,
            'queryString' : queryString,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
          };

        routeToHandler(data, function(statusCode, payload) {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            payload = typeof(payload) == 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            //Send response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            //Log the request
            console.log('Returning this response: ', statusCode,payloadString);
        });
    });
}

// Define the request router
server.router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
  };

// Init script
server.init = function() {
    //start http server
    server.httpServer.listen(config.httpPort, () => {
        console.log(`Server running on port ${config.httpPort} in ${config.envName} mode.`);
    });
    //start https server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log(`Server running on port ${config.httpsPort} in ${config.envName} mode.`);
    });
}

// Export Module
module.exports = server;