var frisby = require('frisby');
frisby.create('POST duplicate mean-wiki user')
	.post('http://wiki-jwgc.rhcloud.com:80/wiki/users/', {
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
	.post('http://wiki-jwgc.rhcloud.com:80/wiki/users/', {
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
		.delete('http://wiki-jwgc.rhcloud.com:80/wiki/users/' + user.id)
		.addHeader('Authorization', 'Basic YWJjZEBzcGFtLmNvbTphYmNk')
		.toss();
	})
	.toss();
