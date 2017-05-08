var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var schema = require('../schemas/project');

module.exports = mongoose.model('Project', schema);
