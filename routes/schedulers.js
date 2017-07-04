var express = require('express')
var router = express.Router();
var bunyan = require('bunyan')
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var config = require('../config.json')
var scheduler = require('../lib/scheduler');

let log = bunyan.createLogger({name:'apiway-api', module: 'router:scheduler'})

router.post('/', function(req, res){
  var response = new Response();
    connectDB()
    .then( data => scheduler.createScheduler(req.body))
    .then( (scheduler) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = "Successfully created"
      response.data = scheduler
      log.info(response)
      res.json(response)
    }).catch( function (error) {
      console.error(error)
      response.responseStatus = RESP.FAIL;
      response.responseMessage = error;
      res.json(response)
    })
});

router.put('/:schedulerId', function(req, res){
  // console.log(req)
  var response = new Response();
  connectDB()
    .then( data => scheduler.updateScheduler(req.params.schedulerId, req.body))
    .then( (scheduler) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = "Successfully updated"
      response.data = scheduler
      log.info(response)
      res.json(response)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.put('/:schedulerId/addSchedules', function(req, res){
  // console.log(req)
  var response = new Response();
  connectDB()
    .then( data => scheduler.addSchedulees(req.params.schedulerId, req.body))
    .then( (scheduler) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = "Successfully added"
      response.data = scheduler
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
    .then( data => scheduler.getSchedulers())
    .then( (schedulers) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = "Successfully retrieved"
      response.data = {
        "schedulers" : schedulers
      }
      res.json(response)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.get('/:schedulerId', function(req, res){
  console.log(req.params.schedulerId)
  var response = new Response();
  connectDB()
  .then( data => scheduler.getScheduler(req.params, data))
  .then( (scheduler) => {
    response.responseStatus = RESP.SUCCESS;
    response.responseMessage = "Successfully retrieved"
    response.data = scheduler
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

router.delete('/:schedulerId', function(req, res){
  console.log(req.params.schedulerId)
  var response = new Response();
  connectDB()
    .then( data => scheduler.deleteScheduler(req.params.schedulerId, data))
    .then( (data) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = `${req.params.schedulerId} is successfully deleted`
      // console.log(response)
      res.json(response)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

// router.delete('/:schedulerId/:scheduleId', function(req, res){
//   console.log(req.params.scheduleId)
//   var response = new Response();
//   connectDB()
//     .then( data => scheduler.deleteSchedule(req.params, data))
//     .then( (data) => {
//       response.responseStatus = RESP.SUCCESS;
//       response.responseMessage = `${req.params.scheduleId} is successfully deleted`
//       res.json(response)
//     }).catch( function (error) {
//     console.error(error)
//     response.responseStatus = RESP.FAIL;
//     response.responseMessage = error;
//     res.json(response)
//   })
// });

router.delete('/:scheduleId', function(req, res){
  console.log(req.params.scheduleId)
  var response = new Response();
  connectDB()
    .then( data => scheduler.deleteSchedule(req.params.scheduleId, data))
    .then( (data) => {
      response.responseStatus = RESP.SUCCESS;
      response.responseMessage = `${req.params.scheduleId} is successfully deleted`
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

module.exports = router;
