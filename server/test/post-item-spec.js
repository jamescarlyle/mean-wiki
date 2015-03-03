var frisby = require('frisby');
frisby.create('POST mean-wiki item')
	.post('http://wiki-jwgc.rhcloud.com:80/wiki/users/54f1acedb12420d859f5da2c/items/', {
		"content": "testcreate",
		"name": "#testcreate",
		"serverUpdate": 1234,
		"user_id": "54f1acedb12420d859f5da2c"
	}, 
	{ headers: { 
		"Authorization": "Basic ZHVtbXlAc3BhbS5jb206YWJjZA==",
		"Content-Type": "application/x-www-form-urlencoded"
	}, json: true }
	)
	.expectStatus(200)
	.expectJSON({
		content: "testcreate",
		name: "#testcreate",
		serverUpdate: 1234,
		user_id: "54f1acedb12420d859f5da2c",
		__v: 0
	})
	.expectJSONTypes({
		content: String,
		name: String,
		serverUpdate: Number,
		user_id: String,
		__v: 0,
		id: String
	})
	.afterJSON(function(item) {
		frisby.create('delete item just created in previous test')
		.delete('http://wiki-jwgc.rhcloud.com:80/wiki/users/54f1acedb12420d859f5da2c/items/' + item.id)
		.addHeader('Authorization', 'Basic ZHVtbXlAc3BhbS5jb206YWJjZA==')
		.toss();
	})
	.toss();