'use strict';
describe('remoteStorage', function () {

	var RemoteStorage, Message, $q, Item;
	var item = {};
	item.schema = 'items';
	item.name = '#todo';
	item.id = 'abcd1234';
	item.user_id = '1234abcd';
	item.clientUpdate = 1234;
	item.serverUpdate = 5678;
	item.content = 'hello world';

	beforeEach(angular.mock.module('remoteStorage', function($provide) {
		Item = jasmine.createSpyObj('Item', ['queryModifiedSince']);
		$provide.value('Item', Item);
		Message = jasmine.createSpyObj('Message', ['success', 'failure']);
		$provide.value('Message', Message);
	}));

	beforeEach(inject(function(_$q_, _RemoteStorage_) {
		RemoteStorage = _RemoteStorage_;
		$q = _$q_;
	}));

	it('should save a new item with notification', function() {

		inject(function($rootScope) {
			// this is our mock item resource
			var resourceItemMock = {
				$save: function() {}
			}; 
			// deferred work
			var deferred = $q.defer();

			angular.extend(resourceItemMock, item);
			resourceItemMock.id = null;
			resourceItemMock.serverUpdate = null;
			$rootScope.online = true;

			// return the deferred work's eventual result value (the promise)
			spyOn(resourceItemMock, '$save').and.returnValue(deferred.promise);

 			expect(resourceItemMock.$save).not.toHaveBeenCalled();
			expect(resourceItemMock.id).toBe(null);
			expect(resourceItemMock.clientUpdate).toBe(1234);
			expect(resourceItemMock.serverUpdate).toBe(null);
			expect(resourceItemMock.serverUpdate).not.toBe(resourceItemMock.clientUpdate);
			// now perform the save
			RemoteStorage.store(resourceItemMock);
			expect(resourceItemMock.$save).toHaveBeenCalled();
			// now remove the save function, so it is not serialised in the event
			delete resourceItemMock.$save;
			expect(Message.success).not.toHaveBeenCalled();

			// set a fulfilled value for the promise
			deferred.resolve({id: 'qwerty'});
			$rootScope.$apply();

			// this won't run until the waitsFor returns true
			expect(resourceItemMock.serverUpdate).toBe(resourceItemMock.clientUpdate);
			// now check that the success message was sent
			expect(Message.success).toHaveBeenCalledWith('Item was saved remotely');
		})
	});

	it('should save a new item without notification', inject(function($rootScope) {
		// this is our mock item resource
		var resourceItemMock = {
			$save: function() {}
		}; 
		angular.extend(resourceItemMock, item);
		var deferred = $q.defer();
		$rootScope.online = true;
		// can resolve the deferred work at any time - this sets the promise state (fulfilled) and value
		deferred.resolve({id: 'qwerty'});

		// ensure that save, not update, is called
		resourceItemMock.id = null;
		spyOn(resourceItemMock, '$save').and.returnValue(deferred.promise);

		expect(resourceItemMock.$save).not.toHaveBeenCalled();
		// now perform the save
		RemoteStorage.store(resourceItemMock);
		// now remove the save function, so it is not serialised in the event
		expect(resourceItemMock.$save).toHaveBeenCalled();
	}));
	
	// this code uses the $defer function in angular
	it('should save a new item', inject(function($rootScope) {
		// this is our mock item resource
		var resourceItemMock = {
			$save: function() { }
		}; 
		angular.extend(resourceItemMock, item);
		$rootScope.online = true;

		var deferred = $q.defer();
		var promise = deferred.promise;
		promise.then(function(eventualValue) {
			// populate the resourceItem with returned values from the server
			angular.extend(resourceItemMock, eventualValue);
		});

		resourceItemMock.id = null;
		resourceItemMock.serverUpdate = null;
		spyOn(resourceItemMock, '$save').and.returnValue(promise);

		expect(resourceItemMock.id).toBe(null);
		expect(resourceItemMock.clientUpdate).toBe(1234);
		expect(resourceItemMock.serverUpdate).toBe(null);
		RemoteStorage.store(resourceItemMock);
		expect(resourceItemMock.$save).toHaveBeenCalled();

		// check that the server time was synchronised with the client time
		expect(resourceItemMock.serverUpdate).toBe(resourceItemMock.clientUpdate);
		// message has not been sent, as still waiting on the promise
		expect(Message.success).not.toHaveBeenCalled();
		// need to remove the mock $save method, otherwise it'll appear in the rootscope event (and gets serialised in the expect() comparison)
		delete resourceItemMock.$save;
		// now resolve the promise
		deferred.resolve({ id: "54005ea7b9a5d362994ef0e4", name: "#todo", user_id: "1234abcd", serverUpdate: 1234, content: "hello world", __v: 0 });
		$rootScope.$apply();
		// now check that the success message was sent
		expect(Message.success).toHaveBeenCalledWith('Item was saved remotely');
	}));

	it('should update an existing item', inject(function($rootScope) {
		var resourceItemMock = {
			$update: function() {}
		}; 
		angular.extend(resourceItemMock, item);
		$rootScope.online = true;

		var deferred = $q.defer();	
		var promise = deferred.promise;
		promise.then(function(eventualValue) {
			// populate the resourceItem with returned values from the server
			angular.extend(resourceItemMock, eventualValue);
		});
		spyOn(resourceItemMock, '$update').and.returnValue(promise);

		expect(resourceItemMock.$update).not.toHaveBeenCalled();
		// now perform the save
		RemoteStorage.store(resourceItemMock);
		expect(resourceItemMock.$update).toHaveBeenCalled();
		// set the eventual value for the promise
		deferred.resolve({id: 'qwerty', serverUpdate: 91011});
		$rootScope.$apply();
		// client and server updates should be in sync after a successful save
		expect(resourceItemMock.clientUpdate).toBe(91011);
		expect(resourceItemMock.serverUpdate).toBe(91011);
	}));

	it('should remove an item', function () {
		inject(function($rootScope) {
			var resourceItemMock = {
				$remove: function() {}
			}; 
			var deferred = $q.defer();
			$rootScope.online = true;
			spyOn(resourceItemMock, '$remove').and.returnValue(deferred.promise);

			expect(resourceItemMock.$remove).not.toHaveBeenCalled();
			// now perform the save
			RemoteStorage.remove(resourceItemMock);
			// now remove the save function, so it is not serialised in the event
			expect(resourceItemMock.$remove).toHaveBeenCalled();
			deferred.resolve({});
			$rootScope.$apply();

			expect(Message.success).toHaveBeenCalledWith('Item deleted successfully');
		});
	});


	it('should retrieve an item', function () {
		// just a wrapper for Resource - no testable functionality
	});

	it('should retrieve a list of items', function () {
		RemoteStorage.retrieveModifiedSince('abcd1234', 'items', 1234);
		expect(Item.queryModifiedSince).toHaveBeenCalledWith('abcd1234', 'items', 1234);
	});
});