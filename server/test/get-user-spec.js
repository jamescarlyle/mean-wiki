var frisby = require('frisby');
var SERVER_URL = process.env.SERVER_URL;

frisby.create('GET mean-wiki users')
	.get(SERVER_URL + 'users/')
	.expectStatus(200)
	.expectHeaderContains('content-type', 'application/json')
	.expectJSON('0', {
		emailAddress:'dummy@spam.com',
		__v:0,
		serverUpdate:'2015-02-28T11:56:29.753Z',
		id:'54f1acedb12420d859f5da2c'
	})
	.expectJSONTypes('0', {
		emailAddress: String,
		__v: Number,
		serverUpdate: String,
		id: String
	})
	.toss();
frisby.create('GET mean-wiki user 54f1acedb12420d859f5da2c without authorisation')
	.get(SERVER_URL + 'users/54f1acedb12420d859f5da2c')
	.expectStatus(401)
	.toss();
frisby.create('GET mean-wiki user 54f1acedb12420d859f5da2c with incorrect authorisation')
	.get(SERVER_URL + 'users/54f1acedb12420d859f5da2c', 
		{ headers: { 
			'Authorization': 'Basic YWJjZEBzcGFtLmNvbTphYmNk',
			'Content-Type': 'application/x-www-form-urlencoded'
		} }
	)
	.expectStatus(401)
	.toss();
frisby.create('GET mean-wiki user 54f1acedb12420d859f5da2c with correct authorisation')
	.get(SERVER_URL + 'users/54f1acedb12420d859f5da2c', 
		{ headers: { 
			'Authorization': 'Basic ZHVtbXlAc3BhbS5jb206YWJjZA==',
			'Content-Type': 'application/x-www-form-urlencoded'
		} }
	)
	.expectStatus(200)
	.expectJSON({
		emailAddress:'dummy@spam.com',
		__v:0,
		serverUpdate:'2015-02-28T11:56:29.753Z',
		id:'54f1acedb12420d859f5da2c'
	})
	.expectJSONTypes({
		emailAddress: String,
		__v: Number,
		serverUpdate: String,
		id: String
	})
	.toss();