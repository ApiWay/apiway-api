var Scheduler = require('../models/scheduler');
var config = require('../config.json')

var bunyan = require('bunyan')
let log = bunyan.createLogger({name:'apiway-api', module: 'scheduler'})

exports.createScheduler = function (data) {
  console.log('createScheduler')
  return new Promise((resolve, reject) => {

    Scheduler.create(
      {"schedules" : data.schedules
      },
      function(err, scheduler) {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log('createScheduler done: ')
        console.log(scheduler)
        resolve(scheduler)
      }
    )
  })
}

exports.updateScheduler = function (id, data) {
  console.log('updateScheduler')
  console.log(id)
  return new Promise((resolve, reject) => {
    Scheduler.findOneAndUpdate(
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
        resolve(data)
      })
  })
}

exports.addSchedules = function (id, data) {
  console.log('addSchedules')
  console.log(id)
  return new Promise((resolve, reject) => {
    Scheduler.findOneAndUpdate(
      {"_id": id
      },
      {$push: {schedules: data.schedules}
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

exports.getScheduler = function (data) {
  return new Promise((resolve, reject) => {
    Scheduler.findOne({_id: data.schedulerId})
      .exec(function(err, scheduler) {
          if (err) {
            console.error(err)
            reject(err)
          }
          resolve(scheduler)
        }
      )
  })
}

exports.getSchedulers = function () {
  return new Promise((resolve, reject) => {
    Scheduler.find({})
      .exec(function(err, schedulers) {
          if (err) {
            console.error(err)
            reject(err)
          }
          resolve(schedulers)
        }
      )
  })
}

exports.getSchedules = function (id) {
  return new Promise((resolve, reject) => {
    Scheduler.find({_id: id})
      .sort({_id: -1})
      .exec(function(err, schedules) {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve(schedules)
      }
    )
  })
}

exports.deleteScheduler = function (id) {
  return new Promise((resolve, reject) => {
    Scheduler.findByIdAndRemove(id, function (err, res) {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve()
    });
  })
}

exports.deleteSchedule = function (params) {
  return new Promise((resolve, reject) => {
    Scheduler.update({ _id: params.schedulerId},
      { "$pull": { "schedules": params.scheduleId }},
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
