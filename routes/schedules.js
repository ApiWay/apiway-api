var express = require('express')
var router = express.Router();
var AwPubSub = require('apiway-pubsub')
var bunyan = require('bunyan')
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var config = require('../config.json')
var Project = require('../models/project');
var Schedule = require('../models/schedule');
var User = require('../models/user');
var schedule = require('../lib/schedule')

let log = bunyan.createLogger({name:'apiway-api', module: 'router:schedule'})


router.post('/', function(req, res){
  // console.log(req)
  var response = new Response();
    connectDB()
    .then( data => schedule.createSchedule(req.body))
    .then( (schedule) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = "Successfully created"
      response.data = schedule
      log.info(response)
      res.json(response)
    }).catch( function (error) {
      console.error(error)
      response.responseStatus = RESP.FAIL;
      response.responseMessage = error;
      res.json(response)
    })
});

router.put('/:scheduleId', function(req, res){
  // console.log(req)
  var response = new Response();
  connectDB()
    .then( data => schedule.updateSchedule(req.params.scheduleId, req.body))
    .then( (schedule) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = "Successfully updated"
      response.data = schedule
      log.info(response)
      res.json(response)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.get('/', function(req, res){
  var response = new Response();
  connectDB()
    .then( data => schedule.getSchedules(req.query))
    .then( (schedules) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = "Successfully retrieved"
      response.data = {
        "schedules" : schedules
      }
      res.json(response)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.get('/:scheduleId', function(req, res){
  console.log(req.params.scheduleId)
  connectDB()
  .then( data => schedule.getScheduleByScheduleId(req.params, data))
  .then( (schedule) => {
    response.responseStatus = RESP.SUCCESS;
    response.responseMessage = "Successfully retrieved"
    response.data = schedule
    console.log(response)
    res.json(response)
  }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.get('/users/:userId', function(req, res){
  console.log(req.params.userId)
  connectDB()
    .then( data => schedule.getSchedulesByUserId(req.params, data))
    .then( (schedules) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = "Successfully retrieved"
      response.data = {
        "schedules" : schedules
      }
      res.json(response)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.get('/projects/:projectId', function(req, res){
  console.log(req.params.projectId)
  connectDB()
    .then( data => schedule.getSchedulesByProjectId(req.params, data))
    .then( (schedules) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = "Successfully retrieved"
      response.data = {
        "schedules" : schedules
      }
      res.json(response)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.delete('/:scheduleId', function(req, res){
  console.log(req.params.scheduleId)
  var response = new Response();
  connectDB()
    .then( data => schedule.deleteScheduleByScheduleId(req.params.scheduleId, data))
    .then( (data) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = `${req.params.scheduleId} is successfully deleted`
      // console.log(response)
      res.json(response)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.delete('/projects/:projectId', function(req, res){
  console.log(req.params.projectId)
  var response = new Response();
  connectDB()
    .then( data => schedule.deleteSchedulesByProjectId(req.params.projectId, data))
    .then( (data) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = `${req.params.projectId} is successfully deleted`
      // console.log(response)
      res.json(response)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.delete('/users/:userId', function(req, res){
  console.log(req.params.userId)
  var response = new Response();
  connectDB()
    .then( data => schedule.deleteSchedulesByUserId(req.params.userId, data))
    .then( (data) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = `${req.params.userId} is successfully deleted`
      // console.log(response)
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

// function createSchedule (project) {
//   let awPubSub = new AwPubSub()
//   console.log(project)
//   awPubSub.publish('apiway/schedule/create', JSON.stringify(project)).then(() => {
//     log.info('createSchedule done')
//   })
// }
//
// function updateSchedule (project) {
//   let awPubSub = new AwPubSub()
//   console.log(project)
//   awPubSub.publish('apiway/schedule/update', JSON.stringify(project)).then(() => {
//     log.info('updateSchedule done')
//   })
// }


module.exports = router;
