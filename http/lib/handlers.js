/*
 * Request Handlers
 *
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');
//var config = require('./config');

// Define all the handlers
var handlers = {};

// Ping
handlers.ping = function(data,callback){
    callback(200);
};

// Not-Found
handlers.notFound = function(data,callback){
  callback(404);
};

// Users
handlers.users = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the users methods
handlers._users  = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data,callback){
  // Check that all required fields are filled out
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement){
    // Make sure the user doesnt already exist
    _data.read('users',phone,function(err,data){
      if(err){
        // Hash the password
        var hashedPassword = helpers.hash(password);

        // Create the user object
        if(hashedPassword){
          var userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          };

          // Store the user
          _data.create('users',phone,userObject,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not create the new user'});
            }
          });
        } else {
          callback(500,{'Error' : 'Could not hash the user\'s password.'});
        }

      } else {
        // User alread exists
        callback(400,{'Error' : 'A user with that phone number already exists'});
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }

};

handlers._users.get = function(data, callback) {
    const phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.trim().length == 10 ? data.queryString.phone.trim() : false;
    if(phone) {
    // Get token from headers
    const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the user
        _data.read('users',phone,function(err,data){
          if(!err && data){
            // Remove the hashed password from the user user object before returning it to the requester
            delete data.hashedPassword;
            callback(200,data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
      }
    });
    } else {
        callback(400, {'Error': 'Missing Required Field'});
    }
};

handlers._users.put = function(data, callback) {
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone) {
        if(firstName || lastName || password) {

          const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

          handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if(tokenIsValid) {
              _data.read('users', phone, function(err, userData) {
                if(!err && userData) {
                    //Update
                    if(firstName) {
                        userData.firstName = firstName 
                    }
                    if(lastName) {
                        userData.lastName = lastName 
                    }
                    if(password) {
                        userData.hashedPassword = helpers.hash(password); 
                    }

                    _data.update('user', phone, userData, function(err) {
                        if(err) {
                            callback(200);
                        } else {
                            callback(500, {'Error': 'Couls not update user'});
                        }
                    });

                } else {
                    callback(400, {'Error': 'The specified user does not exist'});
                }
            });
            } else {
              callback(403, {'Error': 'Misssing Required token in header or token is invalid'})
            }
          });
        } else {
            callback(400, {'Error': 'Missing fields to update'});
        }
    } else {
        callback(400, {'Error': 'Missing Required Field'});
    }
}

handlers._users.delete = function(data, callback) {
    const phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.trim().length == 10 ? data.queryString.phone.trim() : false;
    if(phone) {
      const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

      handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
        if(tokenIsValid) {
          _data.read('users', phone, function(err, data) {
            if(!err && data) {
                _data.delete('users', phone, function(err, data) {
                    if(!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete the specified user'});
                    }
                })
            } else {
                callback(400, {'Error': 'Could not find the specified user'});
            }
        });
        } else {
            callback(403, {'Error': 'Misssing Required token in header or token is invalid'})
        }
      });
    } else {
        callback(400, {'Error': 'Missing Required Field'});
    }
}
// =================================================================================================
// Token
handlers.tokens = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._tokens[data.method](data,callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function(data,callback) {
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if(phone && password) {
      // lookup the user
      _data.read('users', phone, function(err, userData) {
          if(!err && userData) {
             const hashedPassword = helpers.hash(password);
             if(hashedPassword === userData.hashedPassword) {
              const tokenId = helpers.createRandomString(20);
              const expires = Date.now() + 1000 * 60 * 60;

              const tokenObject = {
                  'phone': phone,
                  'id': tokenId,
                  'expires': expires
              };

              _data.create('tokens', tokenId, tokenObject, function(err) {
                  if(!err) {
                      callback(200, tokenObject);
                  } else {
                      callback(500, {'Error': 'Could not create new token'});
                  }
              })
             } else {
                 callback(400, {'Error': 'Password did not match the specified user\'s stored user'});
             }
          } else {
              callback(400, {'Error': 'Could not find the specified user'});
          }
      })
  } else {
      callback(400, {'Error': 'Missing required field(s)'});
  }
};

//Required data : Id
//Optional data : none
handlers._tokens.get = function(data,callback) {
  const id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;
  if(id) {
      _data.read('tokens', id, function(err, tokenData) {
          if(!err && tokenData) {
              callback(200, tokenData);
          } else {
              callback(404);
          }
      })
  } else {
      callback(400, {'Error': 'Missing Required Field'});
  }
};

handlers._tokens.put = function(data,callback) {
  const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

  if(id && extend) {
    _data.read('tokens', id, function(err, tokenData) {
      if(!err && tokenData) {
        if(tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          _data.update('tokens', id, tokenData, function(err) {
            if(!err) {
              callback(200);
            } else {
              callback(500, {'Error': 'Could not update token\'s expiration.'})
            }
          })
        } else {
          callback(400, {'Error': 'The token has already expired and cannot be extended.'})
        }
      } else {
        callback(400, {'Error': 'Specified token does not exist'})
      }
    })
  } else {
    callback(400, {'Error': 'Missing Required field(s) or field(s).'})
  }
};

handlers._tokens.delete = function(data,callback) {
  const id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;
  if(id) {
      _data.read('tokens', id, function(err, data) {
          if(!err && data) {
              _data.delete('tokens', id, function(err) {
                  if(!err) {
                      callback(200);
                  } else {
                      callback(500, {'Error': 'Could not delete the specified token'});
                  }
              })
          } else {
              callback(400, {'Error': 'Could not find the specified token'});
          }
      })
  } else {
      callback(400, {'Error': 'Missing Required Field'});
  } 
  
};


handlers._tokens.verifyToken = function(id, phone, callback) {
  _data.read('tokens', id, function(err, tokenData) {
    if(!err && tokenData) {
      if(tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
}

// Ping Handler
handlers.ping = function(data, callback) {
    callback(200);
}

handlers.notFound = function(data, callback) {
    callback(404);
}

module.exports = handlers;