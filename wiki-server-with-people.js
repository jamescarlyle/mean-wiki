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
mongoose.connect('mongodb://localhost:27017/items');

// TODO config
// mongoose.connect(config['database_url']);	

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
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, If-Modified-Since');
	next();
});

// TODO strictly speaking :user and :schema is not needed in this route since item :id is globally unique by itself
router.route('/users/:user/:schema/:id')
	.options(itemController.optionsItem)
	// for put, can't appy req.body to already-found item before saving, and update doesn't call back with updated item
	.put(itemController.putItem)
	// all others, get the item for subsequent method processing
	.all(itemController.allItem)
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
	.get(itemController.getItems)
	.post(itemController.postItem)
;

router.route('/users/:id')
	.get(userController.getUser)
	.put(userController.putUser)
;

router.route('/users')
	.post(userController.postUser)
	//.get(authController.isAuthenticated, userController.getUsers);
	.get(userController.getUsers)
;

app.use('/wiki', router);
app.listen(8080);
console.log('Server running at localhost:8080/');