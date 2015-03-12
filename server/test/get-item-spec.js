var frisby = require('frisby');
var SERVER_URL = process.env.SERVER_URL;

frisby.create('GET mean-wiki items')
	.get(SERVER_URL + 'users/54f1acedb12420d859f5da2c/items', 
		{ headers: { 
			'Authorization': 'Basic ZHVtbXlAc3BhbS5jb206YWJjZA=='
		} }
	)
	.expectJSON('0', {
		content: "dummy",
		name: "#dummy",
		serverUpdate: 1234,
		user_id: "54f1acedb12420d859f5da2c",
		__v: 0,
		id: "54f6339cb72fca98a80fd0fb"
	})
	.expectJSONTypes('0', {
		content: String,
		name: String,
		serverUpdate: Number,
		user_id: String,
		__v: 0,
		id: String
	})
	.expectStatus(200)
	.toss();
frisby.create('GET single mean-wiki item')
	.get(SERVER_URL + 'users/54f1acedb12420d859f5da2c/items/54f6339cb72fca98a80fd0fb', 
		{ headers: { 
			'Authorization': 'Basic ZHVtbXlAc3BhbS5jb206YWJjZA=='
		} }
	)
	.expectJSON({
		content: "dummy",
		name: "#dummy",
		serverUpdate: 1234,
		user_id: "54f1acedb12420d859f5da2c",
		__v: 0,
		id: "54f6339cb72fca98a80fd0fb"
	})
	.expectJSONTypes({
		content: String,
		name: String,
		serverUpdate: Number,
		user_id: String,
		__v: 0,
		id: String
	})
	.expectStatus(200)
	.toss();
