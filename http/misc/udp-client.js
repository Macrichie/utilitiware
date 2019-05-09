/*
 * Example UDP Client
 * Sending a message to a UDP server on port 6000
 *
 */

// Dependencies
const dgram = require('dgram');

// Create the client
var client = dgram.createSocket('udp4');


// Define the message and pull it into a buffer
const messageString = 'This is a message';
const messageBuffer = Buffer.from(messageString);

 // Send the message
client.send(messageBuffer, 6000, 'localhost', function(err){
  client.close();
});