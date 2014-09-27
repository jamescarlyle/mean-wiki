'use strict';
describe('authenticate', function () {

	var Authenticate, Message, $q, User;
	var user = {};
	user.name = 'james carlyle';
	user._id = 'abcd1234';
	user.emailAddress = 'j@j.com';
	user.passwordHash = 'xyz';

	beforeEach(angular.mock.module('authenticate', function($provide) {
		// User = jasmine.createSpyObj('User', ['get']);
		User = {
			get: function() { }
		}; 
		$provide.value('User', User);
		Message = jasmine.createSpyObj('Message', ['success', 'failure']);
		$provide.value('Message', Message);
	}));

	beforeEach(inject(function(_$q_, _Authenticate_) {
		Authenticate = _Authenticate_;
		$q = _$q_;
	}));

	it('should login', function () {
		var cred = {emailAddress: 'j@j.com', passwordHash: 'xyz'};
		var promise = new Promise(function(resolve, reject) {
			// always resolve rather than reject, for this test
			resolve({_id: 'qwerty'});
		});
		spyOn(User, 'get').andReturn(promise);

		var isItDone = false;
    	runs(function() {
			var user = Authenticate.login(cred);
			// expect(User.get).toHaveBeenCalledWith({emailAddress: cred.emailAddress, passwordHash: cred.passwordHash}, function() {}, function() {})
			expect(user._id).toBeUndefined();
		});
		promise.then(function(val) {
			isItDone = true; 
		});
		waitsFor(function() {
			return isItDone;
		});

		runs(function() {
			expect(user._id).toBe('abcd1234');
		});

	});

});