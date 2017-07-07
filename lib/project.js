var Project = require('../models/project');
var Scheduler = require('../models/scheduler');
var config = require('../config.json')
var AwPubSub = require('apiway-pubsub')

var bunyan = require('bunyan')
var scheduler = require('./scheduler');
let log = bunyan.createLogger({name:'apiway-api', module: 'schedule'})

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

function deleteEmailSubscriber (projectId, email) {
  console.log('deleteEmailSubscriber: ' + email)
  return new Promise((resolve, reject) => {
    Project.update({"_id": projectId},
      { "$pull": { "subscriber": email }},
      { safe: true, multi:true },
      function(err, obj) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      });
  })
}

function addEmailSubscriber (projectId, email) {
  console.log('addEmailSubscriber')
  console.log(projectId)
  return new Promise((resolve, reject) => {
    Project.findOneAndUpdate(
      {"_id": projectId
      },
      {$addToSet: {subscriber: email}
      },
      {upsert: true, new: true},
      function(err, data) {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve(data)
      })
  })
}

exports.addEmailSubcriber = addEmailSubscriber
exports.deleteEmailSubcriber = deleteEmailSubscriber
