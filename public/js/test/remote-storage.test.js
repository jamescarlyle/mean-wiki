'use strict';
describe('remoteStorage', function () {

	var RemoteStorage, Message, $q;
	var item = {};
	item.schema = 'items';
	item.name = '#todo';
	item._id = 'abcd1234';
	item.user = '1234abcd';
	item.clientUpdate = 1234;
	item.serverUpdate = 5678;
	item.content = 'hello world';

	beforeEach(angular.mock.module('remoteStorage', function($provide) {
		Message = jasmine.createSpyObj('Message', ['success', 'failure']);
		$provide.value('Message', Message);
	}));

	beforeEach(inject(function(_$q_, _RemoteStorage_) {
		RemoteStorage = _RemoteStorage_;
		$q = _$q_;
	}));

	// this uses the new Promise api, but we have to jump through hoops with jasmine 1.3
	it('should save a new item with notification', inject(function($rootScope) {
		// this is our mock item resource
		var resourceItemMock = {
			$save: function() {}
		}; 
		angular.extend(resourceItemMock, item);
		resourceItemMock._id = null;
		resourceItemMock.serverUpdate = null;
		spyOn($rootScope, '$emit');

		var promise = new Promise(function(resolve, reject) {
			// always resolve rather than reject, for this test
			resolve({_id: 'qwerty'});
		});
		spyOn(resourceItemMock, '$save').andReturn(promise);
		var isItDone = false;

    	runs(function() {
			expect(resourceItemMock.$save).not.toHaveBeenCalled();
			expect(resourceItemMock._id).toBe(null);
			expect(resourceItemMock.clientUpdate).toBe(1234);
			expect(resourceItemMock.serverUpdate).toBe(null);
			expect(resourceItemMock.serverUpdate).toNotBe(resourceItemMock.clientUpdate);
			// now perform the save
			RemoteStorage.store(resourceItemMock, true);
			// now remove the save function, so it is not serialised in the event
			expect(resourceItemMock.$save).toHaveBeenCalled();
			delete resourceItemMock.$save;
			expect(Message.success).not.toHaveBeenCalled();
			expect($rootScope.$emit).not.toHaveBeenCalled();
		});

		promise.then(function(val) {
			isItDone = true; 
		});
		waitsFor(function() {
			return isItDone;
		});

		runs(function() {
			// this won't run until the waitsFor returns true
			expect(resourceItemMock.serverUpdate).toBe(resourceItemMock.clientUpdate);
			// now check that the success message was sent
			expect(Message.success).toHaveBeenCalledWith('Item was saved remotely');
			expect($rootScope.$emit).toHaveBeenCalledWith('remoteStorageStored', { schema : 'items', name : '#todo', _id : null, user : '1234abcd', clientUpdate : 1234, serverUpdate : 1234, content : 'hello world' });
		});
	}));

	it('should save a new item without notification', inject(function($rootScope) {
		// this is our mock item resource
		var resourceItemMock = {
			$save: function() {}
		}; 
		angular.extend(resourceItemMock, item);
		// ensure that save, not update, is called
		resourceItemMock._id = null;
		spyOn($rootScope, '$emit');

		var promise = new Promise(function(resolve, reject) {
			// always resolve rather than reject, for this test
			resolve({_id: 'qwerty'});
		});
		spyOn(resourceItemMock, '$save').andReturn(promise);
		var isItDone = false;

    	runs(function() {
			expect(resourceItemMock.$save).not.toHaveBeenCalled();
			// now perform the save
			RemoteStorage.store(resourceItemMock, false);
			// now remove the save function, so it is not serialised in the event
			expect(resourceItemMock.$save).toHaveBeenCalled();
			expect($rootScope.$emit).not.toHaveBeenCalled();
		});

		promise.then(function(val) {
			isItDone = true; 
		});
		waitsFor(function() {
			return isItDone;
		});

		runs(function() {
			expect($rootScope.$emit).not.toHaveBeenCalled();
		});
	}));
	
	// this code uses the $defer function in angular
	it('should save a new item', inject(function($rootScope) {
		var deferred = $q.defer();
		var promise = deferred.promise;
		var resolvedValue;
		
		promise.then(function(value) {
			resolvedValue = value;
		});

		// this is our mock item resource
		var resourceItemMock = {
			$save: function() {}
		}; 
		angular.extend(resourceItemMock, item);
		resourceItemMock._id = null;
		resourceItemMock.serverUpdate = null;
		spyOn(resourceItemMock, '$save').andReturn(promise);
		spyOn($rootScope, '$emit');

		expect(resourceItemMock._id).toBe(null);
		expect(resourceItemMock.clientUpdate).toBe(1234);
		expect(resourceItemMock.serverUpdate).toBe(null);
		RemoteStorage.store(resourceItemMock, false);
		expect(resourceItemMock.$save).toHaveBeenCalled();
		// check that the server time was synchronised with the client time
		expect(resourceItemMock.serverUpdate).toBe(resourceItemMock.clientUpdate);
		// message has not been sent, as still waiting on the promise
		expect(Message.success).not.toHaveBeenCalled();
		// need to remove the mock $save method, otherwise it'll appear in the rootscope event (and gets serialised in the expect() comparison)
		delete resourceItemMock.$save;
		// now resolve the promise
		deferred.resolve({_id: 'qwerty'});
		$rootScope.$apply();
		// now check that the success message was sent
		expect(Message.success).toHaveBeenCalledWith('Item was saved remotely');
		// expect($rootScope.$emit).toHaveBeenCalledWith('remoteStorageStored', { schema : 'items', name : '#todo', _id : null, user : '1234abcd', clientUpdate : 1234, serverUpdate : 1234, content : 'hello world' });
	}));

	it('should update an existing item', inject(function($rootScope) {
		var resourceItemMock = {
			$update: function() {}
		}; 
		angular.extend(resourceItemMock, item);
		spyOn($rootScope, '$emit');

		var promise = new Promise(function(resolve, reject) {
			// always resolve rather than reject, for this test
			resolve({_id: 'qwerty'});
		});
		spyOn(resourceItemMock, '$update').andReturn(promise);
		var isItDone = false;

    	runs(function() {
			expect(resourceItemMock.$update).not.toHaveBeenCalled();
			// now perform the save
			RemoteStorage.store(resourceItemMock, true);
			// now remove the save function, so it is not serialised in the event
			expect(resourceItemMock.$update).toHaveBeenCalled();
			expect($rootScope.$emit).not.toHaveBeenCalled();
		});

		promise.then(function(val) {
			isItDone = true; 
		});
		waitsFor(function() {
			return isItDone;
		});

		runs(function() {
			expect($rootScope.$emit).toHaveBeenCalled();
		});
	}));

	it('should remove an item', function () {
		var resourceItemMock = {
			$remove: function() {}
		}; 
		var promise = new Promise(function(resolve, reject) {
			resolve();
		});
		spyOn(resourceItemMock, '$remove').andReturn(promise);
		var isItDone = false;

    	runs(function() {
			expect(resourceItemMock.$remove).not.toHaveBeenCalled();
			// now perform the save
			RemoteStorage.remove(resourceItemMock);
			// now remove the save function, so it is not serialised in the event
			expect(resourceItemMock.$remove).toHaveBeenCalled();
		});

		promise.then(function(val) {
			isItDone = true; 
		});
		waitsFor(function() {
			return isItDone;
		});

		runs(function() {
			expect(Message.success).toHaveBeenCalledWith('Item deleted successfully');
		});
	});

	it('should retrieve an item', function () {
		// just a wrapper for Resource - no testable functionality
	});

	it('should retrieve a list of items', function () {
		// TODO
	});
});