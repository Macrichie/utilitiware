//Dependencies
const config = require('./config');
const crypto = require('crypto');

const helpers = {};

helpers.parseJsonToObject = function(str) {
    try{
        const obj = JSON.parse(str);
        return obj;
    } catch(e) {
        return {}
    }
};

// Create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
      var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
      return hash;
    } else {
      return false;
    }
  };


  // Export the module
module.exports = helpers;