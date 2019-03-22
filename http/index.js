const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const _data = require('./lib/data');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// TESTING
// @TODO delete this
//Create
// _data.create('test', 'dbfile', {'first_name': 'Olakunle', 'last_name': 'Makanjuola', 'hobby': 'Coding', 'age': '36'}, function(err) {
//     console.log('This was the error: ', err);
// });
//Read
// _data.read('test', 'dbfile',function(err,data) {
//     console.log('This was the error: ', err, 'This is the data: ', data);
// });
//Update
// _data.update('test', 'dbfile', {'first_name': 'Semira', 'last_name': 'Makanjuola', 'hobby': 'Feeding', 'age': 1}, function(err) {
//     console.log('This was the error: ', err);
// });
//Delete
// _data.delete('test', 'dbfile',function(err) {
//     console.log('This was the error: ', err);
// });

//instantiating http server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

//start http server
httpServer.listen(config.httpPort, () => {
    console.log(`Server running on port ${config.httpPort} in ${config.envName} mode.`);
});

//instantiating https server
const httpsServerOptions = {
    'key':fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

//start https server
httpsServer.listen(config.httpsPort, () => {
    console.log(`Server running on port ${config.httpsPort} in ${config.envName} mode.`);
});

const unifiedServer = (req, res) => {
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

        const routeToHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

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
var router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens': handlers.tokens
  };