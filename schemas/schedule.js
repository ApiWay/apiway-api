var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var scheduleSchema = new Schema({
  projectId: String,
  owner: String,
  data: String,
  state: { type: String, default: "inactive" },
  cron: { type: String, default: "* */1 * * *" },
  schedulerId: String
});

module.exports = scheduleSchema;
