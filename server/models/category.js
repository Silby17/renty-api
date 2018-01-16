const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
mongoose.Promise = require('bluebird');

var CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
});

CategorySchema.methods.toJSON = function() {
    var category = this;
    var categoryObject = category.toObject();
    return _.pick(categoryObject, ['_id', 'name']);
};

var Category = mongoose.model('Category', CategorySchema);

module.exports = {Category};