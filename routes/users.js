var express = require('express')
var router = express.Router();
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var response = new Response();
// var bodyParser = require('body-parser')
// var Axios = require('axios')
// var Request = require('request')
// var config = require('./config.json')
// var timestamp = require('unix-timestamp')
var User = require('../models/user');
// var request_params;
// var request_body;

router.post('/', function(req, res){
  // console.log(req)
    connectDB()
    .then( data => createUser(req.body, data))
    .then( (id) => {
      response.responseMessage = RESP.SUCCESS
      response.data = {
        "userId": id
      }
      res.json(response)
    }).catch( function (error) {
      console.error(error)
      response.responseStatus = RESP.FAIL;
      response.responseMessage = error;
      res.json(response)
    })
});


function connectDB () {
  return new Promise((resolve, reject) => {
    db.connect().then( function (connection) {
      resolve(connection)
    }).catch( function (error) {
      reject(error)
    })
  })
}

function createUser (data) {
  return new Promise((resolve, reject) => {
    var userId = data.login + '@' + data.oauthProvider
    var query = User.findOneAndUpdate(
      {"login": data.login},
      {$set:{
        'login': data.login,
        'avatarUrl': data.avatarUrl,
        'email': data.email,
        'oauthProvider': data.oauthProvider,
        'userId': data.login + '@' + data.oauthProvider
        },
      },
      {upsert: true, new: true},
      function(err, user) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log('createUser done: ' + user.userId)
        resolve(user.userId)
      }
    )
  })
}


module.exports = router;
