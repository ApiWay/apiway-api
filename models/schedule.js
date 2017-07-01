var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var schema = require('../schemas/schedule');

module.exports = mongoose.model('Schedule', schema);
