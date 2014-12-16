'use strict';
describe('authenticate', function () {

	var Authenticate, Message, $q, $rootScope, User;
	var user = {};
	user.name = 'james carlyle';
	user.id = 'abcd1234';
	user.emailAddress = 'j@j.com';
	user.passwordHash = 'xyz';

	beforeEach(angular.mock.module('authenticate', function($provide) {
		User = {
			get: function() { }
		}; 
		$provide.value('User', User);
		Message = jasmine.createSpyObj('Message', ['success', 'failure']);
		$provide.value('Message', Message);
	}));

	beforeEach(inject(function(_$rootScope_, _$q_, _Authenticate_) {
		$rootScope = _$rootScope_;
		$q = _$q_;
		Authenticate = _Authenticate_;
	}));

	it('should login and set a message', function () {
		var authUser;
		var deferred = $q.defer();
		var promise = deferred.promise;
		promise.then(function(eventualValue) {
			// populate the user with returned values from the server
			angular.extend(authUser, eventualValue);
		});

		spyOn(User, 'get').and.returnValue(deferred.promise);

		authUser = Authenticate.login(user);

		expect(User.get).toHaveBeenCalledWith({emailAddress: user.emailAddress, passwordHash: user.passwordHash}, jasmine.any(Function), jasmine.any(Function))
		// TODO expect(User.get).toHaveBeenCalledWith({emailAddress: user.emailAddress, passwordHash: user.passwordHash})
		expect(authUser.id).toBeUndefined();
		deferred.resolve(user);
		$rootScope.$apply();

		expect(authUser.id).toBe('abcd1234');
	});

	it('should provide a message on successful login', function () {
		Authenticate.successMessage(user);
		expect(Message.success).toHaveBeenCalledWith('You logged in successfully');
	});

	// it('should login and set a message - second pattern', function () {
	// 	var authUser;
	// 	var promise = new Promise(function(resolve, reject) {
	// 		// always resolve rather than reject, for this test
	// 		resolve(user);
	// 	});

	// 	spyOn(User, 'get').and.returnValue(promise);

	// 	var isItDone = false;
	// 	runs(function() {
	// 		authUser = Authenticate.login(user);
	// 		expect(User.get).toHaveBeenCalledWith({emailAddress: user.emailAddress, passwordHash: user.passwordHash}, jasmine.any(Function), jasmine.any(Function));
	// 		expect(authUser.id).toBeUndefined();
	// 	});
	// 	promise.then(function(value) {
	// 		// populate the user with returned values from the server
	// 		angular.extend(authUser, value);
	// 		isItDone = true; 
	// 	});
	// 	waitsFor(function() {
	// 		return isItDone;
	// 	});

	// 	runs(function() {
	// 		expect(authUser.id).toBe('abcd1234');
	// 	});

	// });


});