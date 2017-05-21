var express = require('express')
var router = express.Router();
var async = require('async')
var spawn = require('child_process').spawn
var fs = require('fs');
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var response = new Response();
var Instance = require('../models/instance');
var Project = require('../models/project');
var tcRunnerConfig = require('../config/tc-runner-pod.json')
var TC_RUNNER_PREFIX = 'tc-runner-'

router.post('/', function(req, res){
  // console.log(req)
    connectDB()
    .then( data => getProjectByProjectId(req.body, data))
    .then( data => createInstance(data, data))
    .then( data => setupDocker(data, data))
    .then( data => runDocker(data, data))
    .then( (data) => {
      response.responseMessage = RESP.SUCCESS
      response.data = {
        "instanceId": data._id
      }
      res.json(response)
    }).catch( function (error) {
      console.error(error)
      response.responseStatus = RESP.FAIL;
      response.responseMessage = error;
      res.json(response)
    })
});

router.get('/:instanceId', function(req, res){
  // console.log(req.query)
  connectDB()
  .then( data => getInstanceByInstanceId(req.params, data))
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

router.get('/users/:userId', function(req, res){
  // console.log(req.query)
  connectDB()
  .then( data => getInstancesByUserId(req.params, data))
  .then( (instances) => {
    response.responseMessage = RESP.SUCCESS
    response.data = {
      instances: instances
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
  // console.log(req.query)
  connectDB()
  .then( data => getInstancesByProjectId(req.params, data))
  .then( (instances) => {
    response.responseMessage = RESP.SUCCESS
  response.data = {
    instances: instances
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
      // console.log('createInstance done: ' + instance)
      resolve(instance)
    })
  })
}

function runDocker(data) {
  return new Promise((resolve, reject) => {
    let configFile = tcRunnerConfig.metadata.name + '.json'
    let cmd = `kubectl create -f ${configFile} && rm -f ${configFile}`
    runInBash(cmd, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function setupDocker(data) {
  return new Promise((resolve, reject) => {
    let id = data._id
    tcRunnerConfig.metadata.name = TC_RUNNER_PREFIX + id
    let configFile = tcRunnerConfig.metadata.name + '.json'
    let configString = JSON.stringify(tcRunnerConfig)
    fs.writeFileSync(configFile, configString, 'utf8')
    // console.log(tcRunnerConfig)
    // console.log('in setupDocker: resolve')
    resolve(data)
  })
}

function runInBash(cmd, cb) {
  console.log("runInBash: " + cmd);
  // console.log('bok--------1 ' + logCmd);
  var proc = spawn('/bin/bash', ['-c', cmd ])
  // proc.stdout.pipe(utils.lineStream(log.info))
  // proc.stderr.pipe(utils.lineStream(log.error))
  // proc.on('error', cb)
  proc.on('error', function (err) {
    console.log(err)
    cb(err);
  });

  proc.on('close', function(code) {
    var err
    console.log("close: " + code);
    if (code) {
      err = new Error(`Command "${cmd}" failed with code ${code}`)
      err.code = code
      // err.logTail = log.getTail()
    }
    cb(code)
  })
}



module.exports = router;
