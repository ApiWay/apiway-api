var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var userSchema = require('../schemas/user');

module.exports = mongoose.model('User', userSchema);
