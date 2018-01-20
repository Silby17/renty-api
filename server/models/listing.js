var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var ListingSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    dailyPrice: {
        required: true,
        type: Number
    },
    weeklyPrice: {
        required: true,
        type: Number
    },
    monthlyPrice: {
        required: true,
        type: Number
    },
    imageUrl: {
        type: [String]
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    active: {
        type: Boolean
    }
});

var Listing = mongoose.model('Listing', ListingSchema);

module.exports = {Listing};