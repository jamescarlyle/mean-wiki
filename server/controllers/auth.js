// rhc env set GOOGLE_CLIENT_ID=???????? --app wiki
// rhc env set GOOGLE_CLIENT_SECRET=???????? --app wiki
// rhc env set SERVER_URL=http://wiki-jwgc.rhcloud.com:80/wiki/ --app wiki
// rhc env set CLIENT_URL=http://jamescarlyle.github.io/mean-wiki/#/ --app wiki
// load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy
var User = require('../models/user');
var https = require('https');
var querystring = require('querystring');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('mpromise');

passport.use(new BasicStrategy(
	function(username, password, callback) {
		User.findOne({emailAddress : username}, function (err, user) {
			if (err) { return callback(err); }
			// no user found with that emailAddress
			if (!user) { return callback(null, false); }
			// make sure the password is correct
			user.verifyPassword(password, function(err, isMatch) {
				if (err) { return callback(err); }
				// password did not match
				if (!isMatch) { return callback(null, false); }
				// success
				return callback(null, user);
			});
		});
	}
));

passport.use(new BearerStrategy({ 'passReqToCallback': true },
	function(req, accessToken, callback) {
		// validate the accessToken by comparing it to the original values hashed
		bcrypt.compare(process.env.GOOGLE_CLIENT_SECRET + req.params.user_id, accessToken, function(err, isMatch) {
			if (err) { return callback(err); }
			// password did not match
			if (!isMatch) { return callback(null, false); }
			// success
			return callback(null, {id: req.params.user_id});
		});
	}
));

exports.isAuthenticated = passport.authenticate(['basic','bearer'], { session : false });

exports.google = function(req, res, next) {
	res.redirect('https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=' + process.env.GOOGLE_CLIENT_ID + '&redirect_uri=' + process.env.SERVER_URL + 'authenticate/authCode/&scope=openid email&state=1234');
};

exports.authCode = function(req, res, next) {
	var authCode = req.query.code;
	var postData = querystring.stringify({
		'grant_type': 'authorization_code',
		'code': authCode,
		'client_id' : process.env.GOOGLE_CLIENT_ID,
		'client_secret': process.env.GOOGLE_CLIENT_SECRET,
		'redirect_uri': process.env.SERVER_URL + 'authenticate/authCode/'
	});
	var options = {
		hostname: 'www.googleapis.com',
		port: 443,
		path: '/oauth2/v3/token',
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	};

	var tokenReq = https.request(options, function(response) {
		var body = '';
		response.on('data', function(chunk) {
			body += chunk;
		});
		response.on('end', function() {
			try {
				var parsed = JSON.parse(body);
				var buf = new Buffer(parsed.id_token.split('.')[1], 'base64');
				var claim = JSON.parse(buf.toString());
			} catch (err) {
				res.statusCode = 500;
				res.end('Unable to parse authorization code. Error:' + err.message);
			};
			// look for the user and return a promise 
			User.findOne({emailAddress : claim.email}).exec()
			.then(function (user) {
				// once the search promise is fulfilled, see if a user is found
				if (user) {
					// found, so return a promise with the user immediately
					var p = new Promise;
					p.fulfill(user);
					return p;
				} else {
					// not found, so return a promise to create a user
					return User.create({emailAddress: claim.email});
				}
			})
			// when the user promise is fulfilled, generate a bearer
			.then(function (user) {
				if (!user) {
					res.statusCode = 500;
					res.end('Cannot create or find user by email.');
				};
				user.generateBearer(function(err, accessToken) {
					if (err) {
						res.statusCode = 500;
						res.end('Cannot generate bearer accessToken from authorization code. Error:' + err.message);
					} else {
						res.redirect(process.env.CLIENT_URL + 'auth/bearer?id=' + user._id + '&bearer=' + accessToken);
					};
				});
			});
		});
	}).on('error', function (err) {
		res.statusCode = 500;
		res.end('Cannot exchange authorization code for user identity claims. Error:' + err.message);

	});
	tokenReq.write(postData);
	tokenReq.end();
};