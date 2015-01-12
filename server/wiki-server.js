var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/items');

var Item = require('./models/item');
var itemRouter = express.Router();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, If-Modified-Since');
	next();
});


itemRouter.route('/:id')
	.options(function(req, res, next) {
		res.send();
	})
	// for put, can't appy req.body to already-found item before saving, and update doesn't call back with updated item
	.put(function(req, res, next) {
		console.log('http ' + req.method + ' called with ' + req.url);
		console.log('headers ' + JSON.stringify(req.headers));
		console.log('body ' + JSON.stringify(req.body));
		console.log('id' + req.params.id);
			Item.findOneAndUpdate({ _id : req.params.id}, req.body, function(err, item) {
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
		Item.findById(req.params.id, function(err, item) {
			if (err) {
				res.send(err);
			} else if (!item) {
				res.send(404);
			} else {
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
			res.send(304);
		}
	})
	.head(function(req, res, next) {
		if (!req.headers['if-modified-since'] || req.item.serverUpdate > req.headers['if-modified-since']) {
			res.send();
		} else {
			res.send(304);
		}
	})
	.delete(function(req, res, next) {
		req.item.remove(function(err, item) {
			res.send();
		});
	})
;

itemRouter.route('/')
	.options(function(req, res, next) {
		res.send();
	})
	.get(function(req, res, next) {
		console.log('http GET called for all modified since ' + req.headers['if-modified-since']);
		console.log('headers ' + JSON.stringify(req.headers));
		Item.find((req.headers['if-modified-since'] ? {'serverUpdate': {'$gt': req.headers['if-modified-since']} }: {}), function(err, items) {
			if (err) {
				res.send(err);
			} else {
				res.json(items);
			}
		});
	})
	.post(function(req, res, next) {
		console.log('http POST called with ' + JSON.stringify(req.body));
		var item = new Item(req.body);
		item.save(function(err) {
			if (err) {
				res.send(err);
			} else {
				res.json(item);
			}
		});

	})
;

app.use('/items', itemRouter);
app.listen(8080);
console.log('Server running at localhost:8080/');