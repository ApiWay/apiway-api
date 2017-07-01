var Promise = require('promise');
var mongoose = require('mongoose');
var config = require('../config.json')
var MONGODB_URL = config.db.MONGODB_URL_DEV;
// var MONGODB_URL = config.db.MONGODB_URL;
var DB_FILE = config.db.DB;
var DB_URI = 'mongodb://' + MONGODB_URL + '/' + DB_FILE;

mongoose.Promise = global.Promise;
mongoose.set('debug, true');

exports.connect = function () {
  console.log("url = " + MONGODB_URL);
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState) {
      console.log('reuse connection')
      resolve(mongoose.connection)
    } else {
      console.log('new connection')
      mongoose.connect(DB_URI)
      initListener(resolve, reject)
    }
  })
}

exports.close = function () {
  mongoose.connection.close()
}

function initListener (resolve, reject) {
  mongoose.connection.on('error', function (err) {
    console.error.bind(console, 'connection error:');
    console.log("error: " + err);
    reject(err)
  });

  mongoose.connection.once('open', function () {
    console.log("db opened");
    resolve(mongoose.connection)
  });

  mongoose.connection.on('connected', function (ref) {
    console.log('connected to mongo server.');
  });

  mongoose.connection.on('disconnected', function () {
    console.log('disconnected from mongo server.: ');
  });

  mongoose.connection.on('close', function (ref) {
    console.log('close connection to mongo server');
  });

  mongoose.connection.db.on('reconnect', function (ref) {
    console.log('reconnect to mongo server.');
  });
}
