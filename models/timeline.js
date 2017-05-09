var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var schema = require('../schemas/timeline');

module.exports = mongoose.model('Timeline', schema);
