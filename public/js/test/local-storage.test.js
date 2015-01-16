'use strict';

describe('localStorage', function () {
	var LocalStorage;
	var date = {};
	date.now = function now() {
		return 1234;
    };
	var item = {};
	item.name = '#todo';
	item.id = 'abcd1234';
	item.user_id = '1234abcd';
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
				id: this.id, 
				// user_id: this.user_id,
				clientUpdate: this.clientUpdate,
				serverUpdate: this.serverUpdate,
				content: this.content
			});
		} else {
			return JSON.stringify({
				id: this.id, 
				// user_id: this.user_id,
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
		spyOn(window.Date, 'now').and.callFake(function() {
			return 1234;
		});
		localStorage.removeItem('#todo');
		expect(localStorage['#todo']).toBeUndefined;
		LocalStorage.store(item);
		expect(localStorage['#todo']).toBe('{"id":"abcd1234","clientUpdate":5678,"serverUpdate":5678,"content":"hello world"}');
	});

	it('should update an item which already exists', function () {
		item.clientUpdate = 0;
		spyOn(window.Date, 'now').and.callFake(function() {
			return 1234;
		});
		LocalStorage.store(item);
		expect(localStorage['#todo']).toBe('{"id":"abcd1234","clientUpdate":1234,"serverUpdate":5678,"content":"hello world"}');
		item.content = 'new content';
		LocalStorage.store(item);
		expect(localStorage['#todo']).toBe('{"id":"abcd1234","clientUpdate":1234,"serverUpdate":5678,"content":"new content"}');
	});

	it('should retrieve an item by name', function () {
		LocalStorage.store(item);
		var testItem = LocalStorage.retrieveByName('#todo');
		expect(testItem.asString).toBe(item.asString);
	});

	it('should return empty object (no id) when retrieving item by name which doesn\'t exist', function () {
		var testItem = LocalStorage.retrieveByName('#does not exist');
		expect(testItem.id).toBeUndefined();
	});

	it('should retrieve an item by schema', function () {
		LocalStorage.store(item);
		var testItem = LocalStorage.retrieveBySchema('items', 'todo');
		expect(testItem.asString).toBe(item.asString);
	});

	it('should retrieve a list of names, schema, syncStatus for all items', function () {
		LocalStorage.store(item);
		var testItems = LocalStorage.retrieveAll();
		expect(Object.keys(testItems).length).toBe(1);
		var testItem = testItems[item.name];
		expect(testItem.schema).toBe(item.schema);
		expect(testItem.name).toBe(item.name.slice(1));
		expect(testItem.syncStatus.status).toBe(item.syncStatus.status);
		expect(testItem.syncStatus.message).toBe(item.syncStatus.message);
	});

	it('should remove an item stored', function () {
		LocalStorage.store(item);
		LocalStorage.remove(item);
		var retrievedItem = LocalStorage.retrieveBySchema('items', 'todo');
		expect(JSON.stringify(retrievedItem)).toBe('{"name":"#todo"}');
	});
});