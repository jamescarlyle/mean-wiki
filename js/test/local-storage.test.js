'use strict';

describe('localStorage', function () {
	var LocalStorage, RemoteStorage, Message;
	var item = {
		name: '#todo',
		id: 'abcd1234',
		user_id: '1234abcd',
		clientUpdate: 1234,
		serverUpdate: 5678,
		content: 'hello world'
	};
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
		module('localStorage');
		module(function($provide) {
			$provide.value('RemoteStorage', {
				store: function(resourceItem, callback) { callback(resourceItem); }
			});
			$provide.value('Message', {
				success: function(messageString) { }
			});
		});
		inject(function(_LocalStorage_, _RemoteStorage_, _Message_) {
			LocalStorage = _LocalStorage_;
			RemoteStorage = _RemoteStorage_;
			Message = _Message_;
		});
	});

	// could also inject(function(LocalStorage) instead of funtion()
	it('should have a LocalStorage singleton', function() {
		expect(LocalStorage).toBeDefined;
	});

	it('should store an item locally offline which doesn\'t already exist', function () {
		// localStorage is a local machine instance, i.e. not the service
		localStorage.removeItem('#todo');
		expect(localStorage['#todo']).toBeUndefined;
		LocalStorage.store(item, false);
		expect(localStorage['#todo']).toBe('{"id":"abcd1234","clientUpdate":1234,"serverUpdate":5678,"content":"hello world"}');
	});

	it('should store an item locally and also try and store on server, which doesn\'t already exist', function () {
		// localStorage is a local machine instance, i.e. not the service
		localStorage.removeItem('#todo');
		expect(localStorage['#todo']).toBeUndefined;
		spyOn(RemoteStorage, 'store').and.callThrough();
		spyOn(LocalStorage, 'updateLocalStorage').and.callThrough();
		LocalStorage.store(item, true);
		expect(RemoteStorage.store).toHaveBeenCalledWith(item, LocalStorage.updateLocalStorage);
		expect(LocalStorage.updateLocalStorage).toHaveBeenCalledWith({ name: '#todo', id: 'abcd1234', user_id: '1234abcd', clientUpdate: 1234, serverUpdate: 5678, content: 'hello world' });
		expect(localStorage['#todo']).toBe('{"id":"abcd1234","clientUpdate":1234,"serverUpdate":5678,"content":"hello world"}');
	});

	it('should update an item which already exists', function () {
		LocalStorage.store(item, false);
		expect(localStorage['#todo']).toBe('{"id":"abcd1234","clientUpdate":1234,"serverUpdate":5678,"content":"hello world"}');
		item.content = 'new content';
		item.clientUpdate = 2345;
		LocalStorage.store(item);
		expect(localStorage['#todo']).toBe('{"id":"abcd1234","clientUpdate":2345,"serverUpdate":5678,"content":"new content"}');
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
		LocalStorage.store(item, false);
		var testItem = LocalStorage.retrieveBySchema('items', 'todo');
		expect(testItem.asString).toBe(item.asString);
	});

	it('should retrieve a list of names, schema, syncStatus for all items', function () {
		LocalStorage.store(item, false);
		var testItems = LocalStorage.retrieveAll();
		expect(testItems.length).toBe(1);
		var testItem = testItems[0];
		expect(testItem.schema).toBe(item.schema);
		expect(testItem.name).toBe(item.name.slice(1));
		expect(testItem.syncStatus.status).toBe(item.syncStatus.status);
		expect(testItem.syncStatus.message).toBe(item.syncStatus.message);
	});

	it('should remove an item stored', function () {
		LocalStorage.store(item, false);
		LocalStorage.remove(item);
		var retrievedItem = LocalStorage.retrieveBySchema('items', 'todo');
		expect(JSON.stringify(retrievedItem)).toBe('{"name":"#todo"}');
	});
});