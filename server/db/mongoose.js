var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var options = {useMongoClient: true};
mongoose.connect('mongodb://silby:silby@ds129906.mlab.com:29906/renty', options);

module.exports = {mongoose};