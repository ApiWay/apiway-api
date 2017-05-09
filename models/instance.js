var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var schema = require('../schemas/instance');

module.exports = mongoose.model('Instance', schema);
