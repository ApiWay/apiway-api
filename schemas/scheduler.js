var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schedulerSchema = new Schema({
  schedules: [String],
  name: String
});

module.exports = schedulerSchema;
