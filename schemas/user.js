var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    login: String,
    avatarUrl: String,
    email: String,
    oauthProvider: String,
});

module.exports = userSchema;
