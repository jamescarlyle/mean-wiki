// load required packages
var Item = require('../models/item');
var Person = require('../models/person');

// create endpoint for /users/123/items/abc for all methods
exports.allItem = function(req, res, next) {
	console.log('http ' + req.method + ' called with ' + req.url);
	console.log('headers ' + JSON.stringify(req.headers));
	req.schema = (req.params.schema == 'items' ? Item : Person);
	// TODO see if we still need to set req.user
	// if we use non-url user identification, need to set req.user - else we can use req.params.user_id
	// use req.user.id (set during authentication phase) to restrict query, to enforce authorisation
	req.schema.findOne({ user_id : req.params.user_id, _id : req.params.id }, function(err, item) {
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
};

// create endpoint for /users/123/items/ for all methods
exports.allItems = function(req, res, next) {
	console.log('http ' + req.method + ' called with ' + req.url);
	console.log('headers ' + JSON.stringify(req.headers));
	req.schema = (req.params.schema == 'items' ? Item : Person);
	next();
};

// create endpoint for /users/123/items/abc for HEAD
exports.headItem = function(req, res) {
	// item earlier retrieved during allItem step
	if (!req.headers['if-modified-since'] || req.item.serverUpdate > req.headers['if-modified-since']) {
		res.send();
	} else {
		res.status(304).end()
	}
};

// create endpoint for /users/123/items/abc for PUT
exports.putItem = function(req, res) {
	console.log('http ' + req.method + ' called with ' + req.url);
	console.log('headers ' + JSON.stringify(req.headers));
	console.log('body ' + JSON.stringify(req.body));
	console.log('id' + req.params.id);
	req.schema = (req.params.schema == 'items' ? Item : Person);
	// use the req.user saved during the authentication step - this ensures that only items belonging to the user can be updated, even if the user is authenticated
	req.schema.findOneAndUpdate({ user_id : req.params.user_id, _id : req.params.id }, req.body, function(err, item) {
		if (err) {
			res.send(err);
		} else {
			res.json(item);
		}
	});
};

// create endpoint for /users/123/items/ for POST
exports.postItem = function(req, res) {
	console.log('http POST for User ' + req.params.user_id + ' ' + req.params.schema + ' called with ' + JSON.stringify(req.body));
	var item = new req.schema(req.body);
	item.user_id = req.params.user_id;
	item.save(function(err) {
		if (err) {
			res.send(err);
		} else {
			res.json(item);
		}
	});
};

// create endpoint for /users/123/items/abc for GET
exports.getItem = function(req, res) {
	// return item if no if-modified-since header, or item has been modified since
	if (!req.headers['if-modified-since'] || req.item.serverUpdate > req.headers['if-modified-since']) {
		console.log('returning item ' + req.item.name);
		res.json(req.item);
	} else {
		res.status(304).end()
	}
};

// create endpoint for /users/123/items/ for GET
exports.getItems = function(req, res) {
	console.log('http GET called for all modified since ' + req.headers['if-modified-since']);
	console.log('headers ' + JSON.stringify(req.headers));
	// we always need to use the user id (taken from url) to partition the item results
	var queryParams = { user_id: req.params.user_id };
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
};

// create endpoint for /users/123/items/abc for DELETE
exports.deleteItem = function(req, res) {
	req.item.remove(function(err, item) {
		res.send();
	});
};
// create endpoint for /users/123/items/abc for OPTIONS
exports.optionsItem = function(req, res) {
	res.send();
};