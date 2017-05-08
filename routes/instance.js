var express = require('express')
var router = express.Router();
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var response = new Response();
var Instance = require('../models/instance');
var Project = require('../models/project');

router.post('/', function(req, res){
  // console.log(req)
    connectDB()
    .then( data => getProjectByProjectId(req.body, data))
    .then( data => createInstance(data, data))
    .then( (id) => {
      response.responseMessage = RESP.SUCCESS
      response.data = {
        "instanceId": id
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
  // console.log(req.query)
  connectDB()
  .then( data => getInstanceByInstanceId(req.query, data))
  .then( (instance) => {
    response.responseMessage = RESP.SUCCESS
    response.data = instance
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
  .then( data => getInstancesByUserId(req.query, data))
  .then( (instances) => {
    response.responseMessage = RESP.SUCCESS
    response.data = {
      projects: instances
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
  .then( data => getInstancesByProjectId(req.query, data))
  .then( (instances) => {
    response.responseMessage = RESP.SUCCESS
  response.data = {
    projects: instances
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

function getInstanceByInstanceId(data) {
  return new Promise((resolve, reject) => {
      Instance.findOne(
        {"_id": data.instanceId},
        function(err, instance) {
          if (err) {
            console.error(err)
            reject(err)
          }
          resolve(instance)
        }
      )
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
        // console.log(project)
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

function getInstancesByUserId (data) {
  return new Promise((resolve, reject) => {
      Instance.find(
      {"owner": data.userId},
      function(err, instances) {
        if (err) {
          console.error(err)
          reject(err)
        }
        // console.log(instances)
        resolve(instances)
      }
    )
})
}

function getInstancesByProjectId (data) {
  return new Promise((resolve, reject) => {
      Instance.find(
      {"project.projectId": data.projectId},
      function(err, instances) {
        if (err) {
          console.error(err)
          reject(err)
        }
        // console.log(instances)
        resolve(instances)
      }
    )
})
}

function createInstance(data) {
  return new Promise((resolve, reject) => {
    console.log(data)
    var d = {
      project: {
        name: data.name,
        fullName: data.fullName,
        projectId: data._id,
        url: data.url,
        provider: data.provider
      },
      owner: data.owner,
      startTime: 0,
      status: "Running",
      log: "xxx"
    }
    var instance = new Instance(d)
    instance.save((err) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      console.log('createInstance done: ' + instance._id)
      resolve(instance._id)
    })
  })
}


module.exports = router;
