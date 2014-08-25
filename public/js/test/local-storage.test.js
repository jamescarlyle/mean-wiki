'use strict';

describe('localStorage', function () {
	var LocalStorage;
	var item = {};
	item.schema = 'items';
	item.name = '#todo';
	item._id = 'abcd1234';
	item.user = '1234abcd';
	item.clientUpdate = 1234;
	item.serverUpdate = 5678;
	item.content = 'hello world';

	beforeEach(function() {
		// TODO remove dependency of local storage on resources and remote storage
		var MessageMock = { };
		var resourcesMock = { };
		var remoteStorageMock = {
			// TODO these mock methods are not needed, since the remote storage instance is never called from local storage
			store: function(resourceItem, raiseEvent) {
			},
			remove: function(resourceItem) {
			}
		};
		module(function($provide){
			$provide.value('Message', MessageMock);
			$provide.value('resources', resourcesMock);
			$provide.value('remoteStorage', remoteStorageMock);
		});
    });
	beforeEach(angular.mock.module('localStorage'))

	beforeEach(angular.mock.inject(function(_LocalStorage_) {
		LocalStorage = _LocalStorage_;
	}));

	// could also inject(function(LocalStorage) instead of funtion()
	it('should have a LocalStorage singleton', function() {
		expect(LocalStorage).toBeDefined;
	});

	it('should store an item which doesn\'t already exist', function () {
		localStorage.removeItem('#todo');
		expect(localStorage['#todo']).toBeUndefined;
		LocalStorage.store(item);
		expect(localStorage['#todo']).toBe('{"_id":"abcd1234","user":"1234abcd","clientUpdate":1234,"serverUpdate":5678,"content":"hello world"}');
	});

	it('should update an item which already exists', function () {
		localStorage['#todo'] = '{"_id":"abcd1234","user":"1234abcd"}';
		expect(localStorage['#todo']).toBe('{"_id":"abcd1234","user":"1234abcd"}');
		LocalStorage.store({name:'#todo', _id:'abcd1234', user:'zzzz'});
		expect(localStorage['#todo']).toBe('{"_id":"abcd1234","user":"zzzz"}');
	});

	it('should raise an event when signalled, and an item is stored', inject(function($rootScope) {
		spyOn($rootScope, '$emit');
		LocalStorage.store(item, true);
		expect($rootScope.$emit).toHaveBeenCalledWith('localStorageStored', { schema : 'items', name : '#todo', _id : 'abcd1234', user : '1234abcd', clientUpdate : 1234, serverUpdate : 5678, content : 'hello world' });
	}));

	it('should raise an event when signalled, and an item is stored', inject(function($rootScope) {
		spyOn($rootScope, '$emit');
		LocalStorage.store(item, false);
		expect($rootScope.$emit).toNotHaveBeenCalled;
	}));

	it('should retrieve a value', function () {
		
	});

	it('should raise an event when it has stored a value', function () {
		
	});

	it('should remove an item stored', function () {
		
	});
});