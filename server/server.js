// for openshift with default values
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var mongodb_url = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://127.0.0.1:27017/';
// note that process.env.GOOGLE_CLIENT_ID and process.env.GOOGLE_CLIENT_SECRET must also be set using e.g. rhc env set GOOGLE_CLIENT_ID=abcd1234

var db_name = 'wiki';

// load required packages
var express = require('express');
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');

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
router.route('/users/:user_id/:schema/:id')
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

// we need both :user_id and :schema here to filter by user and type
router.route('/users/:user_id/:schema')
	.options(itemController.optionsItem)
	// all others, get the item for subsequent method processing
	.all(authController.isAuthenticated, itemController.allItems)
	// authentication taken care of by all
	.get(itemController.getItems)
	.post(itemController.postItem)
;

router.route('/users/:user_id')
	// TODO refactor this for all, then apply isAuthenticated to all only
	.get(authController.isAuthenticated, userController.getUser)
	.put(authController.isAuthenticated, userController.putUser)
	.delete(authController.isAuthenticated, userController.deleteUser)
;

router.route('/users')
	.post(userController.postUser)
	.get(userController.getUsers)
;

router.route('/authenticate/google')
	.get(authController.google)
;

router.route('/authenticate/authCode')
	.get(authController.authCode)
;

app.use('/wiki', router);
app.listen(server_port, server_ip_address, function() {
	console.log("Listening on " + server_ip_address + ", server_port is " + server_port)
});