var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var timelineSchema = new Schema({
    project: {
      name: String,
      fullName: String,
      projectId: String, //Project._id
      url: String,
      provider: String,
    },
    owner: String, //User._id
    eventTime: Number,
    eventType: String
});

module.exports = timelineSchema;
