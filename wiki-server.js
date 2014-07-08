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
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});


itemRouter.route('/:id')
	.get(function(req, res, next) {
		console.log('http GET called with ' + req.url);
		Item.findById(req.params.id, function(err, item) {
			if (err) {
				res.send(err);
			} else {
				res.json(item);
			}
		});
	})
	.put(function(req, res, next) {
		console.log('http PUT called with ' + JSON.stringify(req.body));
		Item.findByIdAndUpdate(req.params.id, req.body, function(err, item) {
			if (err) {
				res.send(err);
			} else {
				res.json(item);
			}
		});
	})
	.delete(function(req, res, next) {
		console.log('http DELETE called with ' + req.url);
		Item.remove({ _id: req.params.id }, function(err, item) {
			res.json(item);
		});
	})
;

itemRouter.route('/')
	.get(function(req, res, next) {
		console.log('http GET called for all');
		Item.find(function(err, items) {
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