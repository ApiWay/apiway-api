var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var schema = require('../schemas/scheduler');

module.exports = mongoose.model('Scheduler', schema);
