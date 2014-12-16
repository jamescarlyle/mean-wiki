var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/items');
// TODO config
// mongoose.connect(config['database_url']);

//TODO how to cope with multiple models, i.e. Item and Person
var User = require('./models/user');
var Item = require('./models/item');
var Person = require('./models/person');
var itemRouter = express.Router();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, If-Modified-Since');
	next();
});

// TODO strictly speaking :user and :schema is not needed in this route since item :id is globally unique by itself
itemRouter.route('/users/:user/:schema/:id')
	.options(function(req, res, next) {
		res.send();
	})
	// for put, can't appy req.body to already-found item before saving, and update doesn't call back with updated item
	.put(function(req, res, next) {
		console.log('http ' + req.method + ' called with ' + req.url);
		console.log('headers ' + JSON.stringify(req.headers));
		console.log('body ' + JSON.stringify(req.body));
		console.log('id' + req.params.id);
		req.schema = (req.params.schema == 'items' ? Item : Person);
		req.schema.findOneAndUpdate({ _id : req.params.id}, req.body, function(err, item) {
			if (err) {
				res.send(err);
			} else {
				res.json(item);
			}
		});
	})
	// all others, get the item for subsequent method processing
	.all(function(req, res, next) {
		console.log('http ' + req.method + ' called with ' + req.url);
		console.log('headers ' + JSON.stringify(req.headers));
		req.schema = (req.params.schema == 'items' ? Item : Person);
		req.schema.findById(req.params.id, function(err, item) {
			if (err) {
				res.send(err);
			} else if (!item) {
				res.status(404).end()
			} else {
				// TODO we need to know the type of item in the client - but should this be decorated on the client side?
				// TODO or specified here or in resources transformResponse item.schema = req.params.schema;
				req.item = item;
				res.set({'Last-Modified': item.serverUpdate});
				next();
			}
		});
	})
	.get(function(req, res, next) {
		// return item if no if-modified-since header, or item has been modified since
		if (!req.headers['if-modified-since'] || req.item.serverUpdate > req.headers['if-modified-since']) {
			console.log('returning item ' + req.item.name);
			res.json(req.item);
		} else {
			res.status(304).end()
		}
	})
	// TODO check whether this verb is needed - also for other verbs
	.head(function(req, res, next) {
		if (!req.headers['if-modified-since'] || req.item.serverUpdate > req.headers['if-modified-since']) {
			res.send();
		} else {
			res.status(304).end()
		}
	})
	.delete(function(req, res, next) {
		req.item.remove(function(err, item) {
			res.send();
		});
	})
;

// we need both :user and :schema here to filter by user and type
itemRouter.route('/users/:user/:schema')
	.options(function(req, res, next) {
		res.send();
	})
	// all others, get the item for subsequent method processing
	.all(function(req, res, next) {
		console.log('http ' + req.method + ' called with ' + req.url);
		console.log('headers ' + JSON.stringify(req.headers));
		req.schema = (req.params.schema == 'items' ? Item : Person);
		next();
	})
	.get(function(req, res, next) {
		console.log('http GET called for all modified since ' + req.headers['if-modified-since']);
		console.log('headers ' + JSON.stringify(req.headers));
		// we always need to use the user id (taken from url) to partition the item results
		var queryParams = { user_id: req.params.user };
		if (req.headers['if-modified-since']) {
			queryParams.serverUpdate = {'$gt': req.headers['if-modified-since']};
		}
		// req.schema.find((req.headers['if-modified-since'] ? {'serverUpdate': {'$gt': req.headers['if-modified-since']} }: {}), function(err, items) {
		req.schema.find(queryParams, function(err, items) {
			if (err) {
				res.send(err);
			} else {
				res.json(items);
			}
		});
	})
	.post(function(req, res, next) {
		console.log('http POST for User ' + req.params.user + ' ' + req.params.schema + ' called with ' + JSON.stringify(req.body));
		var item = new req.schema(req.body);
		item.user_id = req.params.user;
		item.save(function(err) {
			if (err) {
				res.send(err);
			} else {
				res.json(item);
			}
		});
	})
;

itemRouter.route('/users/:id')
	.get(function(req, res, next) {
		console.log('http GET called for User resource ' + req.params.id);
		User.findById(req.params.id, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				res.json(user);
			}
		});
	})
	.put(function(req, res, next) {
		console.log('http PUT for User called with ' + JSON.stringify(req.body));
		// mongoose will automatically remove the id from the body in strict mode
		User.findOneAndUpdate({ _id : req.params.id}, req.body, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				res.json(user);
			}
		});
	})
;

itemRouter.route('/users')
	.get(function(req, res, next) {
		var query;
		if (req.query.emailAddress && req.query.passwordHash) {
			console.log('http GET called for User with url ' + req.url + ' and query string ' + JSON.stringify(req.query));
			query = User.findOne({emailAddress : req.query.emailAddress, passwordHash : req.query.passwordHash});
		} else if (req.query.emailAddress) {
			console.log('http GET called for User with url ' + req.url + ' and query string ' + JSON.stringify(req.query));
			query = User.findOne({emailAddress : req.query.emailAddress});
		} else {
			console.log('http GET called for Users');
			query = User.find({});
		}
		query.exec(function(err, result) {
			if (err) {
				res.send(err);
			} else {
				res.json(result);
			}
		});
	})
	.post(function(req, res, next) {
		console.log('http POST for User called with ' + JSON.stringify(req.body));
		var user = new User(req.body);
		user.save(function(err) {
			if (err) {
				res.send(err);
			} else {
				res.json(user);
			}
		});

	})
;

app.use('/wiki', itemRouter);
app.listen(8080);
console.log('Server running at localhost:8080/');