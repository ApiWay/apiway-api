var express = require('express')
var router = express.Router();
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var response = new Response();
var User = require('../models/user');

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

router.get('/', function(req, res){
  console.log(req)
  connectDB()
  .then( data => getUser(req.query, data))
  .then( (user) => {
    response.responseMessage = RESP.SUCCESS
    response.data = user
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

function getUser (data) {
  return new Promise((resolve, reject) => {
      User.findOne(
        {"_id": data.userId},
        function(err, user) {
          if (err) {
            console.error(err)
            reject(err)
          }
          console.log('createUser done: ' + user)
          resolve(user)
        }
      )
    })
}

function createUser (data) {
  return new Promise((resolve, reject) => {
    var userId = data.login + '@' + data.oauthProvider
    var query = User.findOneAndUpdate(
      {"login": data.login,
        "oauthProvider": data.oauthProvider
      },
      {$set:{
        'login': data.login,
        'avatarUrl': data.avatarUrl,
        'email': data.email,
        'oauthProvider': data.oauthProvider
        },
      },
      {upsert: true, new: true},
      function(err, user) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log('createUser done: ' + user._id)
        resolve(user._id)
      }
    )
  })
}


module.exports = router;
