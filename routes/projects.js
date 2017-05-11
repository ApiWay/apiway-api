var express = require('express')
var router = express.Router();
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var response = new Response();
var Project = require('../models/project');

router.post('/', function(req, res){
  // console.log(req)
    connectDB()
    .then( data => createProject(req.body, data))
    .then( (id) => {
      response.responseMessage = RESP.SUCCESS
      response.data = {
        "projectId": id
      }
      res.json(response)
    }).catch( function (error) {
      console.error(error)
      response.responseStatus = RESP.FAIL;
      response.responseMessage = error;
      res.json(response)
    })
});

router.get('/:projectId', function(req, res){
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
  return new Promise((resolve, reject) => {
    Project.findOneAndUpdate(
      {"fullName": data.fullName,
        "provider": data.provider
      },
      {$set:{
        'name': data.name,
        'fullName': data.fullName,
        'owner': data.owner,
        'url': data.url,
        'provider': data.provider
        },
      },
      {upsert: true, new: true},
      function(err, project) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log('createProject done: ' + project._id)
        resolve(project._id)
      }
    )
  })
}


module.exports = router;
