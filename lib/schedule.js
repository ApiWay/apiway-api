var Schedule = require('../models/schedule');
var Scheduler = require('../models/scheduler');
var config = require('../config.json')
var AwPubSub = require('apiway-pubsub')

var bunyan = require('bunyan')
var scheduler = require('./scheduler');
let log = bunyan.createLogger({name:'apiway-api', module: 'schedule'})

exports.createSchedule = function (data) {
  console.log('createSchedule')
  console.log(data)
  return new Promise((resolve, reject) => {
    let projectId = data.projectId ? data.projectId : data._id
    let cron = data.cron ? data.cron : config.schedule.default.cron
    let state = data.state ? data.state : config.schedule.default.state
    Schedule.findOneAndUpdate(
      {"projectId": projectId,
        "owner": data.owner
      },
      {"projectId": projectId,
        "owner": data.owner,
        "cron" : cron,
        "state" : state
      },
      {upsert: true, new: true},
      function(err, schedule) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log('createSchedule done: ')
        console.log(schedule)
        pubCreateSchedule(schedule)
        resolve(schedule)
      }
    )
  })
}

exports.updateSchedule = function (id, data) {
  console.log('updateSchedule')
  console.log(id)
  return new Promise((resolve, reject) => {
    Schedule.findOneAndUpdate(
      {"_id": id
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

exports.getSchedules = function (query) {
  return new Promise((resolve, reject) => {
    let limit = query.per_page ? query.per_page : 100
    let skip = query.page ? query.page * query.per_page : 0
    Schedule.find({state: query.state})
      .limit(Number(limit))
      .sort({_id: -1})
      .skip(Number(skip))
      .exec(function(err, schedules) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log(schedules)
        resolve(schedules)
      }
    )
  })
}

exports.getScheduleByScheduleId = function (data) {
  return new Promise((resolve, reject) => {
    Schedule.findOne(
      {"_id": data.scheduleId},
      function(err, schedule) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log(schedule)
        resolve(schedule)
      }
    )
  })
}

exports.getSchedulesByUserId = function (data) {
  return new Promise((resolve, reject) => {
    console.log('.....' + JSON.stringify(data))
    Schedule.find(
      {"owner": data.userId},
      function(err, schedules) {
        if (err) {
          console.error(err)
          reject(err)
        }
        // console.log(schedules)
        resolve(schedules)
      }
    )
  })
}

exports.getSchedulesByProjectId = function (id) {
  return new Promise((resolve, reject) => {
    Schedule.find(
      {"projectId": id},
      function(err, schedules) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log(schedules)
        resolve(schedules)
      }
    )
  })
}

exports.deleteScheduleByScheduleId = function (id) {
  return new Promise((resolve, reject) => {
    Schedule.findByIdAndRemove(id, function (err, res) {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve()
    });
  })
}

exports.deleteSchedulesByProjectId = function (projectId) {
  console.log('deleteSchedulesbyProjectId')
  return new Promise((resolve, reject) => {
    Schedule.remove(
      {
        "projectId": projectId
      }, function (err, res) {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve()
      });
  })
}

exports.deleteSchedulesInSchedulers = function (schedules) {
  console.log('deleteSchedulesInSchedulers')
  return new Promise((resolve, reject) => {
    schedules.forEach(schedule => {
      scheduler.deleteSchedule(schedule._id)
        .then((err, res) => {
          if (err) {
            reject(err)
          }
        })
    })
    resolve()
  })
}

exports.deleteSchedulesByUserId = function (userId) {
  return new Promise((resolve, reject) => {
    Schedule.remove(
      {
        "userId": userId
      }, function (err, res) {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve()
      });
  })
}

function pubCreateSchedule (schedule) {
  let awPubSub = new AwPubSub()
  console.log(schedule)
  awPubSub.publish('apiway/schedule/create', JSON.stringify(schedule))
}
