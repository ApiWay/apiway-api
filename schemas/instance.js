var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var instanceSchema = new Schema({
    project: {
      name: String,
      full_name: String,
      projectId: String, //Project._id
      home_url: String,
      git_url: String,
      provider: String,
    },
    owner: String, //User._id
    startTime: Number,
    endTime: Number,
    locale: String,
    status: String,
    commit: String,
    commitUrl: String,
    branch: String,
    logUrl: String,
    reportJson: String,
    reportHtml: String
});

module.exports = instanceSchema;
