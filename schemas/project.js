var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectSchema = new Schema({
    name: String,
    full_name: String,
    owner: String, //User.userId
    html_url: String,
    git_url: String,
    provider: String,
    default_branch: String,
    projectId: String,
    subscriber: [String],
    scheduleId: String
});

module.exports = projectSchema;
