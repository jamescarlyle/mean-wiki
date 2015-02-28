var frisby = require('frisby');
frisby.create('DELETE undefined mean-wiki user')
		.delete('http://wiki-jwgc.rhcloud.com:80/wiki/users/undefined')
		.addHeader('Authorization', 'Basic YWJjZEBzcGFtLmNvbTphYmNk')
		.expectStatus(401)
		.toss();
// note that test of newly-created user handled in post-user-spec.js