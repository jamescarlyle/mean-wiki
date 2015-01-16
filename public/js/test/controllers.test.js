'use strict';

describe('controllers', function () {
	var ItemDetailCtrl;
	var ItemListCtrl;
	var $scope;
	var $rootScope;
	var routeParamsMock = {schema: 'items', name:'todo'};
	var localStorageMock = {
		// this needs to be defined to return something - anything
		retrieveByName: function() {return {}},
		retrieveBySchema: function() {return {}},
		retrieveAll: function() {return []},
		store: function() { }
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
	var locationMock;
	var itemMock = {};
	itemMock.schema = 'items';
	itemMock.name = '#todo';
	itemMock.id = 'abcd1234';
	itemMock.user_id = '1234abcd';
	itemMock.clientUpdate = 1234;
	itemMock.serverUpdate = 5678;
	itemMock.content = 'hello world';

	beforeEach(angular.mock.module('controllers'));
	beforeEach(angular.mock.inject(function($controller, _$rootScope_) {
		$rootScope = _$rootScope_;
		$scope = $rootScope.$new();
		$scope.currentUser = {id: 'abcd1234'};
		ItemDetailCtrl = $controller('ItemDetailCtrl', {
			$scope: $scope, $rootScope: $rootScope, $routeParams: routeParamsMock, $location: {}, LocalStorage: localStorageMock
		});
		ItemListCtrl = $controller('ItemListCtrl', {
			$scope: $scope, $rootScope: $rootScope, Configuration: configurationMock, RemoteStorage: remoteStorageMock, LocalStorage: localStorageMock
		});
	}));

	it('should load the module and controllers', function() {
		expect(controllers).toBeDefined();
		expect(ItemDetailCtrl).toBeDefined();
		expect($scope.loadItem).toBeDefined;
	});

	it('should load an item', function() {
		// NB don't just spy on methods and expect them to alter variables - need andCallThrough
		spyOn($scope, 'loadItem').and.callThrough(); 
		spyOn(localStorageMock, 'retrieveBySchema').and.returnValue(itemMock);
		$scope.editing = true;
		// TODO test opStatus code 
		// $rootScope.opStatus = 'oldStatus';
		// used in spyOn, so needs to be called through
		$scope.loadItem();
		expect(localStorageMock.retrieveBySchema).toHaveBeenCalledWith('items', 'todo');
		expect($scope.loadItem).toHaveBeenCalled();
		expect($scope.item.id).toBe('abcd1234');
		expect($scope.editing).toBe(false);
		// TODO expect($rootScope.opStatus).toBe('');
	});

	it('should save an item', function() {
		spyOn(localStorageMock, 'store').and.callThrough();
		$scope.item = itemMock;
		$scope.saveItem();
		expect(localStorageMock.store).toHaveBeenCalledWith({ schema : 'items', name : '#todo', id : 'abcd1234', user_id : 'abcd1234', clientUpdate : itemMock.clientUpdate, serverUpdate : 5678, content : 'hello world' }, true);
	});

	it('should refresh items where the remote item has been updated most recently', inject(function($q) {
		var deferred = $q.defer();
		spyOn(remoteStorageMock, 'retrieveModifiedSince').and.returnValue({$promise: deferred.promise});
		// could build a more sophisticated localStorageMock, that returned one of a number of values
		spyOn(localStorageMock, 'retrieveByName').and.returnValue({serverUpdate: 1234, clientUpdate: 5678});
		spyOn(localStorageMock, 'store');
		spyOn($rootScope, '$emit');
		// test 1 - server item more recently updated than client's recognition of server, so update serverUpdate value on client
		$scope.refreshItems();
		deferred.resolve([{name: '#todo', serverUpdate: 9999}]);
		$rootScope.$digest()
		expect(remoteStorageMock.retrieveModifiedSince).toHaveBeenCalled();
		expect(localStorageMock.store).toHaveBeenCalledWith({ serverUpdate : 9999, clientUpdate : 5678 }, false);
	}));

	it('should refresh items where the local item has been refreshed most recently', inject(function($q) {
		var deferred = $q.defer();
		spyOn(remoteStorageMock, 'retrieveModifiedSince').and.returnValue({$promise: deferred.promise});
		// could build a more sophisticated localStorageMock, that returned one of a number of values
		spyOn(localStorageMock, 'retrieveByName').and.returnValue({serverUpdate: 1234, clientUpdate: 5678});
		spyOn($rootScope, '$emit');
		// test 2 - client has correct view of server update, but client has been updated more recently offline
		$scope.refreshItems();
		deferred.resolve([{name: '#todo', serverUpdate: 1234}]);
		$rootScope.$digest()
		expect(remoteStorageMock.retrieveModifiedSince).toHaveBeenCalled();
	}));

	it('should add local items where the item exists remotely but not locally', inject(function($q) {
		var deferred = $q.defer();
		spyOn(remoteStorageMock, 'retrieveModifiedSince').and.returnValue({$promise: deferred.promise});
		spyOn(localStorageMock, 'retrieveByName').and.returnValue({name: '#todo'});
		spyOn(localStorageMock, 'store');
		$scope.refreshItems();
		deferred.resolve([{name: '#todo', serverUpdate: 9999}]);
		$rootScope.$digest()
		expect(remoteStorageMock.retrieveModifiedSince).toHaveBeenCalled();
		expect(localStorageMock.store).toHaveBeenCalledWith({name: '#todo', serverUpdate : 9999}, false);
		expect(Object.keys($scope.items).length).toEqual(1);
		expect(Object.keys($scope.items)).toEqual(['#todo']);
	}));
});