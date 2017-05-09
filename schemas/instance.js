var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var instanceSchema = new Schema({
    project: {
      name: String,
      fullName: String,
      projectId: String, //Project._id
      url: String,
      provider: String,
    },
    owner: String, //User._id
    startTime: Number,
    endTime: Number,
    status: String,
    log: String
});

module.exports = instanceSchema;
