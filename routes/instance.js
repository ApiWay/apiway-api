var express = require('express')
var router = express.Router();
var async = require('async')
var spawn = require('child_process').spawn
var fs = require('fs');
var moment = require('moment')
var bunyan = require('bunyan')
var AwPubSub = require('apiway-pubsub')
var db = require('../utils/db')
var Response = require('../utils/response');
var RESP = require('../utils/response_values');
var response = new Response();
var Instance = require('../models/instance');
var Project = require('../models/project');
var User = require('../models/user');
var tcRunnerConfig = require('../config/apiway-job.json')
var config = require('../config.json')
var TC_RUNNER_PREFIX = 'apiway-job-'

let log = bunyan.createLogger({name:'apiway-api', module: 'instance'})

router.post('/', function(req, res){
  console.log('instance / :POST started')
  if (req.body) {
    connectDB()
    .then( data => getProject(req.body, data))
    .then( data => createInstance(data))
    .then( data => setupDocker(data))
    .then( data => runDocker(data))
    .then( (data) => {
      // console.log(data)
      // console.log(JSON.stringify(data))
      response.responseStatus = RESP.SUCCESS
      response.responseMessage = "OK"
      response.data = {
        "instanceId": data._id
      }
      // console.log(JSON.stringify(response))
      res.json(response)
    }).catch( function (error) {
      console.error(error)
      response.responseStatus = RESP.FAIL
      response.responseMessage = error
      response.data = null
      res.json(response)
    })
  }
});

router.put('/:instanceId', function(req, res){
  connectDB()
    .then( data => updateInstance(req.params.instanceId, req.body, data))
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

router.get('/test', function(req, res){
  let data = "xxxxxx"
  let awPubSub = new AwPubSub()
  awPubSub.publish('apiway/smtp', data).then(() => {
    log.info('sendNotification done')
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

function updateInstance (instanceId, data) {
  return new Promise((resolve, reject) => {

    Instance.findOneAndUpdate(
    {"_id": instanceId
    },
    {$set: data
    },
    {upsert: true, new: true},
    function(err, instance) {
      if (err) {
        console.error(err)
        reject(err)
      }
      // console.log('updateInstance done: ' + instance._id)
      resolve(instance)
      if (data.status == "PASS" || data.status == "FAIL" || data.status == "BROKEN") {
        sendNotification(instance)
      }
    })
  })
}

function sendNotification (instance, data) {
  getProjectByProjectId(instance.project.projectId)
    .then((project) => getUserEmailByProject(project))
    .then((project) => {
      console.log('email = ' + JSON.stringify(project.subscriber))
      let awPubSub = new AwPubSub()
      let message = {
        instance: instance,
        subscriber: project.subscriber
      }
      console.log(message)
      awPubSub.publish('apiway/smtp', JSON.stringify(message)).then(() => {
        log.info('sendNotification done')
      })
    })
}

function getUserEmailByProject (project) {
  return new Promise((resolve, reject) => {
    console.log('getUserEmailByProject')
    console.log(project)
    User.findOne(
      {"_id": project.owner},
      function(err, user) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log(user)
        project.subscriber.push(user.email)
        resolve(project)
      }
    )
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

function getProject (data) {
  if (data.projectId) {
    return getProjectByProjectId(data.projectId)
  } else if (data.full_name) {
    return getProjectByProjectName(data.full_name)
  }
}

function getProjectByProjectId (projectId) {
  log.info('getProjectByProjectId:' + JSON.stringify(projectId))
  return new Promise((resolve, reject) => {
      Project.findOne(
      {"_id": projectId},
      function(err, project) {
        if (err) {
          console.error(err)
          reject(err)
        }
        // console.log('getProjectByProjectId')
        console.log(project)
        resolve(project)
      }
    )
  })
}

function getProjectByProjectName (full_name) {
  // console.log('getProjectByProjectName:' + JSON.stringify(data))
  return new Promise((resolve, reject) => {
      Project.findOne(
      {"full_name": full_name},
      function(err, project) {
        if (err) {
          console.error(err)
          reject(err)
        }
        // console.log('getProjectByProjectName')
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
    log.info('createInstance: ' + JSON.stringify(data))
    var d = {
      project: {
        name: data.name,
        full_name: data.full_name,
        projectId: data._id,
        home_url: data.home_url,
        git_url: data.git_url,
        provider: data.provider
      },
      owner: data.owner,
      startTime: moment().unix(),
      locale: moment.locale(),
      status: "RUNNING",
      logUrl: data.logUrl
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
    // console.log('runDocker: data = ' + data)
    let configFile = tcRunnerConfig.metadata.name + '.json'
    let cmd = `kubectl create -f ${configFile} && rm -f ${configFile}`
    // let cmd = `kubectl create -f ${configFile}`
    // let cmd = 'ls -al'
    runInBash(cmd, (err) => {
      if (err) {
        console.log('runDocker error : ' + err)
        reject(err)
      } else {
        console.log('runDocker done')
        resolve(data)
      }
    })
  })
}

function setupDocker(data) {
  return new Promise((resolve, reject) => {
    let id = data._id
    tcRunnerConfig.metadata.name = TC_RUNNER_PREFIX + id
    tcRunnerConfig.spec.containers[0].env[0].value = id
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
  proc.stdout.on('data', function(data) {
    console.log(data.toString());
  });
  proc.stderr.on('data', function(data) {
    console.log(data.toString());
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
