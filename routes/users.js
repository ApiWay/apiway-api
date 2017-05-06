var express = require('express')
var router = express.Router();
var db = require('../utils/db')
// var bodyParser = require('body-parser')
// var Axios = require('axios')
// var Request = require('request')
// var config = require('./config.json')
// var timestamp = require('unix-timestamp')
// var User = require('../models/user');
// var request_params;
// var request_body;


router.post('/', function(req, res){
  console.log(req.params)
  db.connect(res).then( function () {
    res.json("ok")
    // db.close()
  }).catch( function (error) {
    console.error(error)
    res.json(error)
  })
});


module.exports = router;
