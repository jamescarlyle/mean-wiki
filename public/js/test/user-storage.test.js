'use strict';
describe('userStorage', function () {

	var UserStorage, $q, $rootScope, User, Message;
	var user = {};
	user.id = 'abcd1234';
	user.emailAddress = 'jb@gmail.com';
	user.password = 'helloworld';

	beforeEach(angular.mock.module('userStorage', function($provide) {
		User = { get: function() { } }; 
		$provide.value('User', User);
		Message = jasmine.createSpyObj('Message', ['success', 'failure']);
		$provide.value('Message', Message);
	}));

	beforeEach(inject(function(_$q_, _UserStorage_, _$rootScope_) {
		UserStorage = _UserStorage_;
		$q = _$q_;
		$rootScope = _$rootScope_;
	}));

	it('should retrieve a user by id', function() {
		// deferred work
		var deferred = $q.defer();
		// return the deferred work's eventual result value (the promise)
		spyOn(User, 'get').and.returnValue(deferred.promise);
		// now perform the fetch
		var prom = UserStorage.retrieve(user.id);
		// set a fulfilled value for the promise
		var value;
		prom.then(function(_value_) {
			value = _value_;
		});
		deferred.resolve(user);
		$rootScope.$apply();
		// should fetch the resource
		expect(value.emailAddress).toBe(user.emailAddress);
		// now check that the success message was sent
		expect(User.get).toHaveBeenCalledWith({ id : 'abcd1234' });
	});

	it('should retrieve a user by emailAddress', function() {
		// deferred work
		var deferred = $q.defer();
		// return the deferred work's eventual result value (the promise)
		spyOn(User, 'get').and.returnValue(deferred.promise);
		// now perform the fetch
		var prom = UserStorage.retrieveByEmailAddress(user.emailAddress);
		// set a fulfilled value for the promise
		var value;
		prom.then(function(_value_) {
			value = _value_;
		});
		deferred.resolve(user);
		$rootScope.$apply();
		// should fetch the resource
		expect(value.emailAddress).toBe(user.emailAddress);
		// now check that the success message was sent
		expect(User.get).toHaveBeenCalledWith({ emailAddress : 'jb@gmail.com' });
	});

	it('should update a user with an id', inject(function($rootScope) {
		var userMock = { $update: function() {} };
		var deferred = $q.defer();
		spyOn(userMock, '$update').and.returnValue(deferred.promise);
		userMock.id = '123';
		var promise = UserStorage.store(userMock);
		expect(userMock.$update).toHaveBeenCalled();
		deferred.resolve(userMock);
		$rootScope.$apply();
		expect(Message.success).toHaveBeenCalledWith('Your user record was saved successfully');
	}));

	it('should save a user without an id', inject(function($rootScope) {
		var userMock = { $save: function() {}, $update: function() {} };
		var deferred = $q.defer();
		spyOn(userMock, '$update');
		spyOn(userMock, '$save').and.returnValue(deferred.promise);
		userMock.id = null;
		var promise = UserStorage.store(userMock);
		expect(userMock.$update).not.toHaveBeenCalled();
		expect(userMock.$save).toHaveBeenCalled();
		deferred.resolve(userMock);
		$rootScope.$apply();
		expect(Message.success).toHaveBeenCalledWith('Your user record was saved successfully');
	}));

	it('should update a user with an id and return an error message in the event of failure', inject(function($rootScope) {
		var userMock = { $update: function() {} };
		var deferred = $q.defer();
		spyOn(userMock, '$update').and.returnValue(deferred.promise);
		userMock.id = '123';
		var promise = UserStorage.store(userMock);
		expect(userMock.$update).toHaveBeenCalled();
		deferred.reject('reason: save failed');
		$rootScope.$apply();
		expect(Message.failure).toHaveBeenCalledWith('There was a problem saving your user record. Please try again');
	}));

});