var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://silby:silbyadmin@ds129906.mlab.com:29906/renty');

module.exports = {mongoose};