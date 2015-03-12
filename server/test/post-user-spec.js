var frisby = require('frisby');
var SERVER_URL = process.env.SERVER_URL;

frisby.create('POST duplicate mean-wiki user')
	.post(SERVER_URL + 'users/', {
		"emailAddress":"dummy@spam.com",
		"password":"abcd"
	}, 
	{ headers: { 
			'Content-Type': 'application/x-www-form-urlencoded'
	}, json: true }
	)
	.expectStatus(200)
	.expectJSON({
		"name":"MongoError",
		"err":"E11000 duplicate key error index: wiki.users.$emailAddress_1  dup key: { : \"dummy@spam.com\" }",
		"code":11000,
		"ok":1
	})
	.toss();
frisby.create('POST different mean-wiki user')
	.post(SERVER_URL + 'users/', {
		"emailAddress":"abcd@spam.com",
		"password":"abcd"
	}, 
	{ headers: { 
			'Content-Type': 'application/x-www-form-urlencoded'
	}, json: true }
	)
	.expectStatus(200)
	.expectJSON({
		emailAddress:'abcd@spam.com',
		__v:0
	})
	.afterJSON(function(user) {
		frisby.create('delete user just created in previous test')
		.delete(SERVER_URL + 'users/' + user.id)
		.addHeader('Authorization', 'Basic YWJjZEBzcGFtLmNvbTphYmNk')
		.toss();
	})
	.toss();
