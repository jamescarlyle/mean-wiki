var frisby = require('frisby');
frisby.create('PUT mean-wiki user')
	.put('http://wiki-jwgc.rhcloud.com:80/wiki/users/54f1b347d264fbecd7f2eabd', {
		"emailAddress":"update-me@spam.com",
		"password":"abcd"
	}, 
	{ headers: { 
		'Authorization': 'Basic dXBkYXRlLW1lQHNwYW0uY29tOmFiY2Q=',
		'Content-Type': 'application/x-www-form-urlencoded'
	}, json: true }
	)
	.expectStatus(200)
	.expectJSON({
	})
	.toss();