var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectSchema = new Schema({
    name: String,
    fullName: String,
    owner: String, //User.userId
    url: String,
    provider: String,
    projectId: String
});

module.exports = projectSchema;
