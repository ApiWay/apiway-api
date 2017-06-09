var express = require('express')
var router = express.Router();
var AwPubSub = require('apiway-pubsub')
var bunyan = require('bunyan')
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var response = new Response();
var config = require('../config.json')
var Project = require('../models/project');
var User = require('../models/user');

let log = bunyan.createLogger({name:'apiway-api', module: 'instance'})

router.post('/', function(req, res){
  // console.log(req)
    connectDB()
    .then( data => getUser(req.body, data))
    .then( data => createProject(data))
    .then( (project) => {
      response.responseMessage = RESP.SUCCESS
      response.data = {
        "projectId": project._id
      }
      log.info(response)
      res.json(response)
      startSchedule(project)
    }).catch( function (error) {
      console.error(error)
      response.responseStatus = RESP.FAIL;
      response.responseMessage = error;
      res.json(response)
    })
});

router.put('/:projectId', function(req, res){
  // console.log(req)
  connectDB()
    .then( data => updateProject(req.params.projectId, req.body))
    .then( (project) => {
      response.responseMessage = "Successfully updated"
      response.data = project
      log.info(response)
      res.json(response)
      startSchedule(project)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.get('/:projectId', function(req, res){
  console.log(req.params.projectId)
  connectDB()
  .then( data => getProjectByProjectId(req.params, data))
  .then( (project) => {
    response.responseMessage = RESP.SUCCESS
    response.data = project
    console.log(response)
    res.json(response)
  }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.delete('/:projectId', function(req, res){
  console.log(req.params.projectId)
  connectDB()
    .then( data => deleteProjectByProjectId(req.params.projectId, data))
    .then( (data) => {
      response.responseMessage = "Successfully deleted"
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
  console.log(req.params)
  connectDB()
    .then( data => getProjectsByUserId(req.params, data))
  .then( (projects) => {
    response.responseMessage = RESP.SUCCESS
    response.data = {
      projects: projects
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
          console.log(project)
          resolve(project)
        }
      )
    })
}

function deleteProjectByProjectId (projectId) {
  return new Promise((resolve, reject) => {
    Project.findByIdAndRemove(projectId, function (err, res) {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve()
    });
  })
}

function getUser (data) {
  return new Promise((resolve, reject) => {
    User.findOne(
      {"_id": data.owner},
      function(err, user) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log(user)
        data.email = user.email
        resolve(data)
      }
    )
  })
}

function getProjectsByUserId (data) {
  return new Promise((resolve, reject) => {
    console.log('.....' + JSON.stringify(data))
      Project.find(
      {"owner": data.userId},
      function(err, project) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log(project)
        resolve(project)
      }
    )
  })
}

function createProject (data) {
  console.log('createProject')
  console.log(data)
  data.schedule = config.schedule.default
  return new Promise((resolve, reject) => {
    Project.findOneAndUpdate(
      {"full_name": data.full_name,
        "provider": data.provider,
        "owner": data.owner
      },
      {$set:data
      },
      {upsert: true, new: true},
      function(err, project) {
        if (err) {
          console.error(err)
          reject(err)
        }
        log.info('createProject done: ' + project._id)
        resolve(project)
      }
    )
  })
}

function updateProject (projectId, data) {
  console.log('updateProject')
  console.log(projectId)
  return new Promise((resolve, reject) => {
    Project.findOneAndUpdate(
      {"_id": projectId
      },
      {$set: data
      },
      {upsert: true, new: true},
      function(err, data) {
        if (err) {
          console.error(err)
          reject(err)
        }
        // console.log('updateInstance done: ' + instance._id)
        resolve(data)
        // if (data.status == "PASS" || data.status == "FAIL" || data.status == "BROKEN") {
        //   sendNotification(instance)
        // }
      })
  })
}

function startSchedule (project) {
  let awPubSub = new AwPubSub()
  console.log(project)
  awPubSub.publish('apiway/schedule', JSON.stringify(project)).then(() => {
    log.info('startSchedule done')
  })
}


module.exports = router;
