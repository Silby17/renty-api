const _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Listing} = require('./models/listing');
var {authenticate} = require('./middleware/authenticate');
var multer = require('multer');
var multerS3 = require('multer-s3');
var AWS = require('aws-sdk');
var app = express();
var {upload} = require('./storage/S3Storage');
var {AWS} = require('./storage/S3Storage');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        console.log(e);
        res.status(400).send(e);
    })
});

app.post('/listing', upload.single('myFile'), authenticate, (req, res, next) => {
    var fileLocation = req.file.location;
    var body = _.pick(req.body, ['title', 'category', 'description',
    'price']);
    var listing = new Listing(body);
    listing._creator =  req.user._id;
    listing.imageUrl = fileLocation;
    listing.save().then((doc) => {
        console.log('Created Listing: ', doc);
        res.send(doc);
    }, (err) => {
        res.status(400).send(e);
    });
});


app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});


// Login Post
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send({message: 'wrong'});
    });
});


app.delete('/users/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});




app.listen(3000, () => {
    console.log('Started server on Port 3000');
});