'use strict';

describe('resources module', function () {

	var Item;
	var $httpBackend = null;

	beforeEach(angular.mock.module('resources'));
	beforeEach(angular.mock.inject(function(_Item_, _$httpBackend_) {
		Item = _Item_;
		$httpBackend = _$httpBackend_;
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('should issue a GET with get()', function () {
		$httpBackend.when('GET', 'http://localhost:8080/wiki/users/53e56a9e4938931d944740a3/items/53e68768894643369409fd7f').respond({'_id': '53e68768894643369409fd7f', 'user': '53e56a9e4938931d944740a3', 'name': '#todo', 'content': 'saved\n@james', 'serverUpdate': 1407813235732, '__v': 0});
		var item = Item.get({schema: 'items', _id: '53e68768894643369409fd7f'});
		$httpBackend.flush();
		// need to add angular.equals() if comparing complete objects
		expect(item._id).toEqual('53e68768894643369409fd7f');
	});

	it('should process a PUT with update()', function () {
		var item = new Item();
		// don't need to set 'schema' property, since read-only and derived from name
		item.name = '#todoagain';
		item._id = '53e68768894643369409fd7f';
		item.user = '53e56a9e4938931d944740a3';
		item.content = 'hello cruel world';
		$httpBackend.expect('PUT', 'http://localhost:8080/wiki/users/53e56a9e4938931d944740a3/items/53e68768894643369409fd7f', '{"name":"#todoagain","_id":"53e68768894643369409fd7f","user":"53e56a9e4938931d944740a3","content":"hello cruel world"}').respond(200, '{"name":"#todoagain","_id":"53e68768894643369409fd7f","user":"53e56a9e4938931d944740a3","content":"hello cruel world"}');
		// remember to call the instance method
		item.$update();
		$httpBackend.flush();
		// need to add angular.equals() if comparing complete objects
		expect(item._id).toEqual('53e68768894643369409fd7f');
	});

	it('should process a POST with save()', function () {
		var item = new Item();
		// don't need to set 'schema' property, since read-only and derived from name
		item.name = '#todoagain';
		item.user = '53e56a9e4938931d944740a3';
		item.clientUpdate = 1407813235732;
		item.serverUpdate = 1407813235732;
		item.content = 'saved @james';
		$httpBackend.expect('POST', 'http://localhost:8080/wiki/users/53e56a9e4938931d944740a3/items/', '{"name":"#todoagain","user":"53e56a9e4938931d944740a3","clientUpdate":1407813235732,"serverUpdate":1407813235732,"content":"saved @james"}').respond(200, '{"_id": "53e68768894643369409fd7f", "user": "53e56a9e4938931d944740a3", "name": "#todoagain", "content": "saved @james", "serverUpdate": 1407813235732, "__v": 0 }');
		// remember to call the instance method
		item.$save();
		$httpBackend.flush();
		// need to add angular.equals() if comparing complete objects
		expect(item._id).toEqual('53e68768894643369409fd7f');
	});

	it('should define an item with a syncStatus property', function (done) {
		var item = new Item();
		item.clientUpdate = null;
		item.serverUpdate = null;
		expect(item.syncStatus).toEqual({ status : 'flash', message : 'not saved' });
		item.clientUpdate = 100;
		item.serverUpdate = null;
		expect(item.syncStatus).toEqual({ status : 'open', message : 'needs to be saved remotely' });
		item.clientUpdate = 200;
		item.serverUpdate = 100;
		expect(item.syncStatus).toEqual({ status : 'open', message : 'needs to be saved remotely' });
		item.clientUpdate = 100;
		item.serverUpdate = 200;
		expect(item.syncStatus).toEqual({ status : 'save', message : 'needs to be refreshed locally' });
		item.clientUpdate = 200;
		item.serverUpdate = 200;
		expect(item.syncStatus).toEqual({ status : 'saved', message : 'synchronised' });
		item.clientUpdate = null;
		item.serverUpdate = 100;
		expect(item.syncStatus).toEqual({ status : 'flash', message : 'not saved' });
	});
	
	it('should define an item with a schema property', function (done) {
		var item = new Item();
		item.name = '#todo';
		expect(item.schema).toEqual('items');
		item.name = '@james';
		expect(item.schema).toEqual('people');
	});
	
	it('should define an item with a asString property', function (done) {
		var item = new Item();
		item._id = '54005ea7b9a5d362994ef0e4';
		item.user = '53e56a9e4938931d944740a3';
		item.clientUpdate = 1409819660049;
		item.serverUpdate = 1409654248169;
		item.content = 'To Do list';
		item.name = '#todo';
		expect(item.asString).toEqual('{"_id":"54005ea7b9a5d362994ef0e4","user":"53e56a9e4938931d944740a3","clientUpdate":1409819660049,"serverUpdate":1409654248169,"content":"To Do list"}');
	});
	
});