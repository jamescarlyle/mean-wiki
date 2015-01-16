// load required packages
var User = require('../models/user');

// create endpoint /api/users for POST
exports.postUser = function(req, res) {
	console.log('http POST for User called with ' + JSON.stringify(req.body));
	var user = new User(req.body);
	user.save(function(err) {
		if (err) {
			res.send(err);
		} else {
			res.json(user);
		}
	});
};

// Create endpoint /users for GET
exports.getUsers = function(req, res) {
	var query;
	if (req.query.emailAddress && req.query.password) {
		console.log('http GET called for User with url ' + req.url + ' and query string ' + JSON.stringify(req.query));
		query = User.findOne({emailAddress : req.query.emailAddress, password : req.query.password});
	} else if (req.query.emailAddress) {
		console.log('http GET called for User with url ' + req.url + ' and query string ' + JSON.stringify(req.query));
		query = User.findOne({emailAddress : req.query.emailAddress});
	} else {
		console.log('http GET called for Users');
		query = User.find({});
	};
	query.exec(function(err, result) {
		if (err) {
			res.send(err);
		} else {
			res.json(result);
		}
	});
};

// create endpoint for /users/123 for PUT
exports.putUser = function(req, res) {
	console.log('http PUT for User called with ' + JSON.stringify(req.body));
	// mongoose will automatically remove the id from the body in strict mode
	User.findOneAndUpdate({ _id : req.params.id}, req.body, function(err, user) {
		if (err) {
			res.send(err);
		} else {
			res.json(user);
		}
	});
};

// create endpoint for /users/123 for GET
exports.getUser = function(req, res) {
	console.log('http GET called for User resource ' + req.params.id);
	User.findById(req.params.id, function(err, user) {
		if (err) {
			res.send(err);
		} else {
			res.json(user);
		}
	});
};