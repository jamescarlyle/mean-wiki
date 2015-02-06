'use strict';

describe('controllers', function () {
	var SyncLocalRemote;
	var $rootScope;
	var itemMock = {};
	itemMock.schema = 'items';
	itemMock.name = '#todo';
	itemMock.id = 'abcd1234';
	itemMock.user_id = '1234abcd';
	itemMock.clientUpdate = 1234;
	itemMock.serverUpdate = 5678;
	itemMock.content = 'hello world';
	var localStorageMock = {
		// this needs to be defined to return something - anything
		retrieveByName: function() {return {}},
		retrieveBySchema: function() {return {}},
		retrieveAll: function() {return []},
		store: function() { },
		updateLocalStorage: function() { }
	};
	var remoteStorageMock = {
		retrieveModifiedSince: function() { return {} },
		store: function() {}
	};
	var configurationMock = {
		// this needs to be defined to return something - anything
		getModifiedSince: function() {return 0},
		setModifiedSince: function() {}
	};

	beforeEach(angular.mock.module('syncLocalRemote', function($provide) {
		$provide.value('Configuration', configurationMock);
		$provide.value('RemoteStorage', remoteStorageMock);
		$provide.value('LocalStorage', localStorageMock);
	}));

	beforeEach(angular.mock.inject(function(_SyncLocalRemote_, _$rootScope_) {
		SyncLocalRemote = _SyncLocalRemote_;
		$rootScope = _$rootScope_;
	}));

	// could also inject(function(SyncLocalRemote) instead of funtion()
	it('should have a SyncLocalRemote singleton', function() {
		expect(SyncLocalRemote).toBeDefined;
		expect(remoteStorageMock).toBeDefined
	});

	it('should refresh items where the remote item has been updated most recently', inject(function($q) {
		var deferred = $q.defer();
		spyOn(remoteStorageMock, 'retrieveModifiedSince').and.returnValue({$promise: deferred.promise});
		// could build a more sophisticated localStorageMock, that returned one of a number of values
		spyOn(localStorageMock, 'retrieveByName').and.returnValue({serverUpdate: 1234, clientUpdate: 5678});
		spyOn(localStorageMock, 'store');
		spyOn($rootScope, '$emit');
		// test 1 - server item more recently updated than client's recognition of server, so update serverUpdate value on client
		var callback = jasmine.createSpy('callback');
		SyncLocalRemote.refreshItems({id: 1}, callback);
		deferred.resolve([{name: '#todo', serverUpdate: 9999}]);
		$rootScope.$digest()
		expect(remoteStorageMock.retrieveModifiedSince).toHaveBeenCalled();
		expect(localStorageMock.store).toHaveBeenCalledWith({ serverUpdate : 9999, clientUpdate : 5678 }, false);
		expect(callback).toHaveBeenCalled();
	}));

	it('should refresh items where the local item has been refreshed most recently', inject(function($q) {
		var deferred = $q.defer();
		spyOn(remoteStorageMock, 'retrieveModifiedSince').and.returnValue({$promise: deferred.promise});
		spyOn(remoteStorageMock, 'store');
		// could build a more sophisticated localStorageMock, that returned one of a number of values
		spyOn(localStorageMock, 'retrieveByName').and.returnValue({serverUpdate: 1234, clientUpdate: 5678});
		// test 2 - client has correct view of server update, but client has been updated more recently offline
		var callback = jasmine.createSpy('callback');
		SyncLocalRemote.refreshItems({id: 1}, callback);
		deferred.resolve([{name: '#todo', serverUpdate: 1234}]);
		$rootScope.$digest()
		expect(remoteStorageMock.retrieveModifiedSince.calls.allArgs()).toEqual([[ 1, 'items', 0 ], [ 1, 'people', 0 ]]);
		expect(remoteStorageMock.store).toHaveBeenCalledWith({serverUpdate: 1234, clientUpdate: 5678}, localStorageMock.updateLocalStorage);
		expect(callback).toHaveBeenCalled();
	}));

	it('should add local items where the item exists remotely but not locally', inject(function($q) {
		var deferred = $q.defer();
		spyOn(remoteStorageMock, 'retrieveModifiedSince').and.returnValue({$promise: deferred.promise});
		spyOn(localStorageMock, 'retrieveByName').and.returnValue({name: '#todo'});
		spyOn(localStorageMock, 'store');
		var callback = jasmine.createSpy('callback');
		SyncLocalRemote.refreshItems(1, callback);
		deferred.resolve([{name: '#todo', serverUpdate: 9999}]);
		$rootScope.$digest()
		expect(remoteStorageMock.retrieveModifiedSince).toHaveBeenCalled();
		expect(localStorageMock.store).toHaveBeenCalledWith({name: '#todo', serverUpdate : 9999, clientUpdate: 9999}, false);
		expect(callback).toHaveBeenCalled();
	}));
});
