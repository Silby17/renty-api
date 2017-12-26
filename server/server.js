const _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID}  = require('mongodb');
var {mongoose} = require('./db/mongoose'); //Needed to start connection
var {User} = require('./models/user');
var {Listing} = require('./models/listing');
var {authenticate} = require('./middleware/authenticate');
var app = express();
var {upload} = require('./storage/S3Storage');
const hLogger = require('heroku-logger');

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send({message: "The Mundo API is Live!"})
});


app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password', 'firstName', 'surname']);
    var user = new User(body);
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        hLogger.info('New User created', {user: user.email});
        res.header('x-auth', token).send({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            surname: user.surname
        });
    }).catch((e) => {
        if(e.code === 11000){
            hLogger.error('User already exists', {user: user.email});
            res.status(409).send({"message": "User Already exists"});
        }
        else {
            res.status(400).send(e);
        }
    })
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});


// Login Post
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    console.log('User: - ', body.email, ' - is trying to log in');

    User.findByCredentials(body.email, body.password).then((user) => {
        user.generateAuthToken().then((token) => {
            hLogger.info('User has logged in', {user: user.email});
            res.header('x-auth', token).send({
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                surname: user.surname
            });
        });
    }).catch((e) => {
        hLogger.error('Login Failed', {user: body.email});
        res.status(400).send({message: 'Login Failed'});
    });
});


app.delete('/users/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});


app.post('/listing', upload.single('myFile'), authenticate, (req, res, next) => {
    var fileLocation = req.file.location;
    var body = _.pick(req.body, ['title', 'category', 'description',
        'price']);
    console.log('User trying to upload');
    var listing = new Listing(body);
    listing._creator =  req.user._id;
    listing.imageUrl = fileLocation;
    listing.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(e);
    });
});

app.get('/listings', authenticate, (req, res) => {
    Listing.find({
        _creator: req.user._id
    }).then((listings) => {
        res.send(listings);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/all/listings', (req, res) => {
    Listing.find().then((listings) => {
        res.send({listings});
    }, (err) => {
        res.status(400).send(err);
    });
});

// GET /listings/id
app.get('/listings/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(400).send();
    }
    Listing.findById(id).then((listing) => {
        if(!listing){
            return res.status(404).send();
        }
        res.send(listing);
    }).catch((e) => {
        res.status(400).send();
    });

});


app.listen(port, () => {
    console.log(`Started server on Port ${port}`);
});