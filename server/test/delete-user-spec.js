var frisby = require('frisby');
var SERVER_URL = process.env.SERVER_URL;

frisby.create('DELETE undefined mean-wiki user')
		.delete(SERVER_URL + 'users/undefined')
		.addHeader('Authorization', 'Basic YWJjZEBzcGFtLmNvbTphYmNk')
		.expectStatus(401)
		.toss();
// note that test of newly-created user handled in post-user-spec.js