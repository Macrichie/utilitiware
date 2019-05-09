/*
 * Example TCP (Net) client
 * Connects to port 6000 and sends the word "ping" to servers
 *
 */

// Dependencies
const net = require('net');

// Define the message to send
const outboundMessage = 'ping';

// Create the client
const client = net.createConnection({ port: 6000 }, function(){
  // Send the message
  client.write(outboundMessage);
});

// When the server writes back, log what it says then kill the client
client.on('data',function(inboundMessage){
  const messageString = inboundMessage.toString();
  console.log("I wrote "+outboundMessage+" and they said "+messageString);
  client.end();
});
