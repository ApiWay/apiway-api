var express = require('express')
var router = express.Router();
var bunyan = require('bunyan')
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var response = new Response();
var config = require('../config.json')
var Project = require('../models/project');
var Instance = require('../models/instance');
var User = require('../models/user');
var schedule = require('../lib/schedule')
var awProject = require('../lib/project')

let log = bunyan.createLogger({name:'apiway-api', module: 'instance'})

router.post('/', function(req, res){
  // console.log(req)
    connectDB()
    .then( data => getUser(req.body, data))
    .then( data => createProject(data))
    .then( (project) => {
      response.responseMessage = RESP.SUCCESS
      response.data = project
      log.info(response)
      res.json(response)
      schedule.createSchedule(project)
    }).catch( function (error) {
      console.error(error)
      response.responseStatus = RESP.FAIL;
      response.responseMessage = error;
      res.json(response)
    })
});

router.post('/:projectId/subscribe/email', function(req, res){
  // console.log(req)
  connectDB()
    .then( data => awProject.addEmailSubcriber(req.params.projectId, req.body.email))
    .then( (project) => {
      response.responseStatus = RESP.SUCCESS
      response.responseMessage = "Successfully added"
      response.data = project
      log.info(response)
      res.json(response)
      // updateSchedule(project)
    }).catch( function (error) {
    console.error(error)
    response.responseStatus = RESP.FAIL;
    response.responseMessage = error;
    res.json(response)
  })
});

router.delete('/:projectId/subscribe/email', function(req, res){
  // console.log(req)
  connectDB()
    .then( data => awProject.deleteEmailSubcriber(req.params.projectId, req.query.email))
    .then( (data) => {
      response.responseStatus = data.status
      response.responseMessage = data.msg
      response.data = null
      log.info(response)
      res.json(response)
      // updateSchedule(project)
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
    .then( data => awProject.updateProject(req.params.projectId, req.body))
    .then( (project) => {
      response.responseMessage = "Successfully updated"
      response.data = project
      log.info(response)
      res.json(response)
      // updateSchedule(project)
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
    .then( data => schedule.getSchedulesByProjectId(req.params.projectId, data))
    .then( schedules => schedule.deleteSchedulesInSchedulers(schedules))
    .then( data => schedule.deleteSchedulesByProjectId(req.params.projectId, data))
    .then( data => deleteInstancesByProjectId(req.params.projectId, data))
    .then( data => deleteProjectByProjectId(req.params.projectId, data))
    .then( (data) => {
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

function deleteInstancesByProjectId (projectId) {
  return new Promise((resolve, reject) => {
    Instance.remove(
      {
        "project.projectId": projectId
      }, function (err, res) {
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
    console.log(data)
    User.findOne(
      {"_id": data.owner},
      function(err, user) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log('getUser')
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
      function(err, projects) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log(projects)
        resolve(projects)
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
