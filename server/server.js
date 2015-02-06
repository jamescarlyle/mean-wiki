// for openshift with default values
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var mongodb_url = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://127.0.0.1:27017/';
var db_name = 'wiki';

// load required packages
var express = require('express');
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');

// var MongoClient = require('mongodb').MongoClient;
var itemController = require('./controllers/item');
var userController = require('./controllers/user');
var authController = require('./controllers/auth');

// connect to database
console.log('connecting to MongoDB using connection string ' + mongodb_url + db_name);
mongoose.connect(mongodb_url + db_name);

// create express application
var app = express();
// use body parser
app.use(bodyParser.json());
// use the passport package in our application
app.use(passport.initialize());
// create express router
var router = express.Router();

app.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, If-Modified-Since, Authorization');
    next();
});

// strictly speaking :user and :schema is not needed in this route since item :id is globally unique by itself
router.route('/users/:user/:schema/:id')
    .options(itemController.optionsItem)
    // for put, can't appy req.body to already-found item before saving, and update doesn't call back with updated item
    .put(authController.isAuthenticated, itemController.putItem)
    // all others, get the item for subsequent method processing (protected by setting req.user during authentication and authorising in action)
    .all(authController.isAuthenticated, itemController.allItem)
    .get(itemController.getItem)
    // TODO check whether this verb is needed - also for other verbs
    .head(itemController.headItem)
    .delete(itemController.deleteItem)
;

// we need both :user and :schema here to filter by user and type
router.route('/users/:user/:schema')
    .options(itemController.optionsItem)
    // all others, get the item for subsequent method processing
    .all(authController.isAuthenticated, itemController.allItems)
    // authentication taken care of by all
    .get(itemController.getItems)
    .post(itemController.postItem)
;

router.route('/users/:id')
    .get(authController.isAuthenticated, userController.getUser)
    .put(authController.isAuthenticated, userController.putUser)
;

router.route('/users')
    .post(userController.postUser)
    //.get(authController.isAuthenticated, userController.getUsers);
    .get(userController.getUsers)
;

app.use('/wiki', router);
app.listen(server_port, server_ip_address, function() {
    console.log("Listening on " + server_ip_address + ", server_port is " + server_port)
});