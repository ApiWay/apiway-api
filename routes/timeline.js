var express = require('express')
var router = express.Router();
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var response = new Response();
var Timeline = require('../models/timeline');
var Project = require('../models/project');

router.post('/', function(req, res){
  // console.log(req)
    connectDB()
    .then( data => getProjectByProjectId(req.body, data))
    .then( data => createTimeline(data, data))
    .then( (id) => {
      response.responseMessage = RESP.SUCCESS
      response.data = {
        "timelineId": id
      }
      res.json(response)
    }).catch( function (error) {
      console.error(error)
      response.responseStatus = RESP.FAIL;
      response.responseMessage = error;
      res.json(response)
    })
});

router.get('/users', function(req, res){
  // console.log(req.query)
  connectDB()
  .then( data => getTimelinesByUserId(req.query, data))
  .then( (timelines) => {
    response.responseMessage = RESP.SUCCESS
    response.data = {
      timelines: timelines
    }
    res.json(response)
  }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.get('/projects', function(req, res){
  // console.log(req.query)
  connectDB()
  .then( data => getTimelinesByProjectId(req.query, data))
  .then( (timelines) => {
    response.responseMessage = RESP.SUCCESS
    response.data = {
      timelines: timelines
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

function getProjectByProjectId (data) {
  return new Promise((resolve, reject) => {
      Project.findOne(
      {"_id": data.projectId},
      function(err, project) {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve(project)
      }
    )
  })
}

function getProjectByUserId (data) {
  return new Promise((resolve, reject) => {
      Project.find(
      {"owner": data.userId},
      function(err, project) {
        if (err) {
          console.error(err)
          reject(err)
        }
        // console.log(project)
        resolve(project)
      }
    )
})
}

function getTimelinesByUserId (data) {
  return new Promise((resolve, reject) => {
      Timeline.find(
      {"owner": data.userId},
      function(err, timelines) {
        if (err) {
          console.error(err)
          reject(err)
        }
        // console.log(timelines)
        resolve(timelines)
      }
    )
})
}

function getTimelinesByProjectId (data) {
  return new Promise((resolve, reject) => {
      Timeline.find(
      {"project.projectId": data.projectId},
      function(err, timelines) {
        if (err) {
          console.error(err)
          reject(err)
        }
        // console.log(timelines)
        resolve(timelines)
      }
    )
  })
}

function createTimeline(data) {
  return new Promise((resolve, reject) => {
    // console.log(data)
    var d = {
      project: {
        name: data.name,
        fullName: data.fullName,
        projectId: data._id,
        url: data.url,
        provider: data.provider
      },
      owner: data.owner,
      eventTime: 0,
      eventType: "xxxx"
    }
    var timeline = new Timeline(d)
      timeline.save((err) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log('createTimeline done: ' + timeline._id)
        resolve(timeline._id)
      })
  })
}


module.exports = router;
