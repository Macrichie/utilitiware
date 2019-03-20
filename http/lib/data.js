const fs = require('fs');
const path = require('path')


const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');
// const filePath = lib.baseDir+dir+'/'+file+'.json';
// Create data
lib.create = function(dir,file,data,callback) {
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx',function(err,fileDescriptor){
        if(!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            fs.writeFile(fileDescriptor, stringData, function(err) {
                if(!err) {
                    fs.close(fileDescriptor, function(err) {
                        if(!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    })
                } else {
                    callback('Error writing to new file');
                }
            })
        } else {
            callback('Could not create new file, it may already exist.')
        }
    });
};

// Read data
lib.read = function(dir,file,callback) {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err,data) {
        callback(err,data);
    });
};

// Update data
lib.update = function(dir,file,data,callback) {
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+', function(err,fileDescriptor) {
        if(!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            fs.ftruncate(fileDescriptor, function(err) {
                if(!err) {
                    fs.writeFile(fileDescriptor, stringData, function(err) {
                        if(!err) {
                            fs.close(fileDescriptor, function(err) {
                                if(!err) {
                                    callback(false)
                                } else {
                                    callback('Error closing the file.')
                                }
                            })
                        } else {
                            callback('Error writing to existing file.')
                        }
                    })
                } else {
                    callback('Error truncating file.')
                }
            })
        } else {
            callback('Could not open the file for updating, it may not exist yet.')
        }
    });
};

// DELETE
lib.delete = function(dir,file,callback) {
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err) {
        if(!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

module.exports = lib;