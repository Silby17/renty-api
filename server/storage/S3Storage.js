var multer = require('multer');
var multerS3 = require('multer-s3');
var AWS = require('aws-sdk');

AWS.config.update({region: 'eu-west-1'});

var s3 = new AWS.S3({
    Bucket: 'testing-tent-me'
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: 'testing-tent-me/itemImages',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    })
});

module.exports = {AWS};
module.exports = {s3};
module.exports = {upload};