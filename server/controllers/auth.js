// rhc env set GOOGLE_CLIENT_ID=???????? --app wiki
// rhc env set GOOGLE_CLIENT_SECRET=???????? --app wiki
// rhc env set SERVER_URL=http://wiki-jwgc.rhcloud.com:80/wiki/ --app wiki
// rhc env set CLIENT_URL=http://jamescarlyle.github.io/mean-wiki/#/ --app wiki
// load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');
var https = require('https');
var querystring = require('querystring');

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

exports.isAuthenticated = passport.authenticate('basic', { session : false });

exports.google = function(req, res, next) {
	res.redirect('https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=' + process.env.GOOGLE_CLIENT_ID + '&redirect_uri=' + process.env.SERVER_URL + 'authenticate/authCode/&scope=openid email&state=1234');
};

exports.authenticate = function(req, res, next) {
	var authHeader = req.get('Authorization');
	console.log(authHeader);

	if (authHeader === undefined) {
		res.statusCode = 401;
		res.end('Unauthorized');
	} else {
		next();
	}
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
				res.redirect(process.env.CLIENT_URL + 'authenticate/header?' + querystring.stringify({
					'sub': claim.sub,
					'email': claim.email,
				}));
			} catch (err) {
				console.error('Unable to parse response as JSON', err);
			};			
		});
	}).on('error', function(err) {
		console.error('error with the request:', err.message);
	});

	tokenReq.write(postData);
	tokenReq.end();
};

// exports.facebook = function(req, res, next) {
// 	res.redirect('https://www.facebook.com/dialog/oauth?response_type=code&client_id=1556759154606391&redirect_uri=http://localhost:8080/wiki/authenticate/authCode/&state=1234');
// };

// exports.processFacebookCode = function(req, res, next) {
// 	var authCode = req.query.code;
// 	var postData = querystring.stringify({
// 		'code': authCode,
// 		'client_id' : process.env.FACEBOOK_CLIENT_ID,
// 		'client_secret': process.env.FACEBOOK_SECRET_ID,
// 		'redirect_uri': 'http://localhost:8080/wiki/authenticate/authCode/'
// 	});
// 	var options = {
// 		hostname: 'graph.facebook.com/oauth/access_token',
// 		port: 443,
// 		path: '/oauth2/v3/token',
// 		method: 'POST',
// 		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
// 	};

// 	var tokenReq = https.request(options, function(response) {
// 		var body = '';
// 		response.on('data', function(chunk) {
// 			body += chunk;
// 		});
// 		response.on('end', function() {
// 			try {
// 				var parsed = JSON.parse(body);
// 				var buf = new Buffer(parsed.id_token.split('.')[1], 'base64');
// 				var claim = JSON.parse(buf.toString());
// 				res.redirect('http://localhost:8000/#/authenticate/header?' + querystring.stringify({
// 					'sub': claim.sub,
// 					'email': claim.email,
// 				}));
// 			} catch (err) {
// 				console.error('Unable to parse response as JSON', err);
// 			};			
// 		});
// 	}).on('error', function(err) {
// 		console.error('error with the request:', err.message);
// 	});

// 	tokenReq.write(postData);
// 	tokenReq.end();
// };