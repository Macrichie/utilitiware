/*
* These are server related tasks
* 
*/
// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');
const util = require('util');
const debug = util.debuglog('server');


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

// All the server logic for both http and https server
server.unifiedServer = (req, res) => {
    //Get the url and parse it
    const parseUrl = url.parse(req.url, true);
    //Get the path
    const pathName = parseUrl.pathname;
    const trimmedPath = pathName.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryString = parseUrl.query;
    
    //Get  the HTTP method
    const method = req.method.toLocaleLowerCase();
    
    // Get the header as an object
    const headers = req.headers;
    
    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', data => {
        buffer += decoder.write(data);
    });
    req.on('end', ()=> {
        buffer += decoder.end();

        // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
        let routeToHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // If the request is within the public directory, use the public handler instead
        routeToHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : routeToHandler 

        const data = {
            'trimmedPath' : trimmedPath,
            'queryString' : queryString,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
          };
        // Route the request to the handler specified in the router
        try{
            routeToHandler(data, function(statusCode, payload, contentType) {
                server.processHandlerResponse(res, method, trimmedPath, statusCode, payload, contentType);
            });
        } catch(e) {
            debug(e);
            server.processHandlerResponse(res, method, trimmedPath, 500, {'Error': 'An unknown error has occured'}, 'json')
        }
    });
};

// Process the response from the handler
server.processHandlerResponse = function(res, method, trimmedPath, statusCode, payload, contentType) {
            // Determine the type of response (fallback to json)
            contentType = typeof(contentType) == 'string' ? contentType : 'json';
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //Return the response-part that are content-specific
            let payloadString = '';

            if(contentType == 'json') {
                res.setHeader('Content-Type', 'application/json');
                payload = typeof(payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
            }

            if(contentType == 'html') {
                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof(payload) == 'string' ? payload : '';
            }

            if(contentType == 'favicon') {
                res.setHeader('Content-Type', 'image/x-icon');
                payloadString = typeof(payload) !== "undefined" ? payload : '';
            }

            if(contentType == 'css') {
                res.setHeader('Content-Type', 'text/css');
                payloadString = typeof(payload) !== "undefined" ? payload : '';
            }

            if(contentType == 'png') {
                res.setHeader('Content-Type', 'image/png');
                payloadString = typeof(payload) !== "undefined" ? payload : '';
            }

            if(contentType == 'jpg') {
                res.setHeader('Content-Type', 'image/jpg');
                payloadString = typeof(payload) !== "undefined" ? payload : '';
            }

            if(contentType == 'plain') {
                res.setHeader('Content-Type', 'text/plain');
                payloadString = typeof(payload) !== "undefined" ? payload : '';
            }
            
            //Return the response-part that are common to all content-Types
            res.writeHead(statusCode);
            res.end(payloadString);

            //If the request is 200, print green otherwise print red
            if(statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m', method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
            } else {
                debug('\x1b[31m%s\x1b[0m', method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
            }
};

// Define the request router
server.router = {
    '' : handlers.index,
    'account/create' : handlers.accountCreate,
    'account/edit' : handlers.accountEdit,
    'account/deleted' : handlers.accountDeleted,
    'session/create' : handlers.sessionCreate,
    'session/deleted' : handlers.sessionDeleted,
    'checks/all' : handlers.checksList,
    'checks/create' : handlers.checksCreate,
    'checks/edit' : handlers.checksEdit,
    'ping' : handlers.ping,
    'api/users' : handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    'public': handlers.public,
    'examples/error': handlers.exampleError 
  };

// Init script
server.init = function() {
    //start http server
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[36m%s\x1b[0m',`Server running on port ${config.httpPort} in ${config.envName} mode.`);
    });
    //start https server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[35m%s\x1b[0m',`Server running on port ${config.httpsPort} in ${config.envName} mode.`);
    });
}

// Export Module
module.exports = server;