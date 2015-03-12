var frisby = require('frisby');
var SERVER_URL = process.env.SERVER_URL;

frisby.create('PUT mean-wiki item')
	.put(SERVER_URL + 'users/54f1acedb12420d859f5da2c/items/54f6339cb72fca98a80fd0fb', {
		"content":"dummy",
		"name":"#dummy"
	}, 
	{ headers: { 
		'Authorization': 'Basic ZHVtbXlAc3BhbS5jb206YWJjZA=='
	}, json: true }
	)
	.expectStatus(200)
	.expectJSON({
		content: "dummy",
		name: "#dummy",
		serverUpdate: 1234,
		user_id: "54f1acedb12420d859f5da2c",
		__v: 0
	})
	.toss();