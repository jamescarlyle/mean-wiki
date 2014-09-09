'use strict';

describe('localStorage', function () {
	var LocalStorage;
	var item = {};
	item.name = '#todo';
	item._id = 'abcd1234';
	item.user = '1234abcd';
	item.clientUpdate = 1234;
	item.serverUpdate = 5678;
	item.content = 'hello world';
	Object.defineProperties(item, {
		// determine schema from name: curly brackets define object with key/value properties, array specifies getter for key
		'schema': { get : function() { return {'#':'items','@':'people'}[this.name.charAt(0)]; } },
		// determine syncStatus property by server and client update
		'syncStatus': { get : function() {
			if (!this.clientUpdate) {
				return {status:'flash', message:'not saved'};
			} else if (this.serverUpdate && this.serverUpdate > this.clientUpdate) {
				return {status:'save', message:'needs to be refreshed locally'};
			} else if (!this.serverUpdate || this.serverUpdate < this.clientUpdate) {
				return {status:'open', message:'needs to be saved remotely'};
			} else return {status:'saved', message:'synchronised'}; ;
		}},
		'asString': { get : function() {
			if (this.schema == "items") {
			return JSON.stringify({
				_id: this._id, 
				user: this.user,
				clientUpdate: this.clientUpdate,
				serverUpdate: this.serverUpdate,
				content: this.content
			});
		} else {
			return JSON.stringify({
				_id: this._id, 
				user: this.user,
				clientUpdate: this.clientUpdate,
				serverUpdate: this.serverUpdate,
				emailAddress: this.emailAddress,
				mobileTelephone: this.mobileTelephone,
				homeAddress: this.homeAddress,
				twitterHandle: this.twitterHandle,
				facebook: this.facebook,
				notes: this.notes
			});
		}
		}}
	});

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
		LocalStorage.store(item);
		expect(localStorage['#todo']).toBe('{"_id":"abcd1234","user":"1234abcd","clientUpdate":1234,"serverUpdate":5678,"content":"hello world"}');
		item.content = 'new content';
		LocalStorage.store(item);
		expect(localStorage['#todo']).toBe('{"_id":"abcd1234","user":"1234abcd","clientUpdate":1234,"serverUpdate":5678,"content":"new content"}');
	});

	it('should raise an event when signalled, and an item is stored', inject(function($rootScope) {
		spyOn($rootScope, '$emit');
		LocalStorage.store(item, true);
		expect($rootScope.$emit).toHaveBeenCalledWith('localStorageStored', item);
	}));

	it('should not raise an event when explicit or not specified, and an item is stored', inject(function($rootScope) {
		spyOn($rootScope, '$emit');
		LocalStorage.store(item, false);
		expect($rootScope.$emit).toNotHaveBeenCalled;
		LocalStorage.store(item);
		expect($rootScope.$emit).toNotHaveBeenCalled;
	}));

	it('should retrieve an item', function () {
		LocalStorage.store(item);
		var testItem = LocalStorage.retrieve('items', 'todo');
		expect(testItem.asString).toBe(item.asString);
	});

	it('should retrieve a list of names, schema, syncStatus for all items', function () {
		LocalStorage.store(item);
		var testItems = LocalStorage.retrieveAll();
		expect(testItems.length).toBe(1);
		var testItem = testItems[0];
		expect(testItem.schema).toBe(item.schema);
		expect(testItem.name).toBe(item.name.slice(1));
		expect(testItem.syncStatus.status).toBe(item.syncStatus.status);
		expect(testItem.syncStatus.message).toBe(item.syncStatus.message);
	});

	it('should remove an item stored', function () {
		LocalStorage.store(item);
		LocalStorage.remove(item);
		var retrievedItem = LocalStorage.retrieve('items', 'todo');
		expect(JSON.stringify(retrievedItem)).toBe('{"name":"#todo"}');
	});
});