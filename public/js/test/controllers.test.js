'use strict';

describe('controllers', function () {
	var ItemDetailCtrl;
	var ItemListCtrl;
	var $scope;
	var $rootScope;
	var routeParamsMock = {schema: 'items', name:'todo'};
	var localStorageMock = {
		// this needs to be defined to return something - anything
		retrieve: function() {return {}},
		retrieveAll: function() {return []},
		store: function() { }
	};
	var remoteStorageMock = {
		retrieveModifiedSince: function() { return {} }
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
	itemMock._id = 'abcd1234';
	itemMock.user = '1234abcd';
	itemMock.clientUpdate = 1234;
	itemMock.serverUpdate = 5678;
	itemMock.content = 'hello world';

	beforeEach(angular.mock.module('controllers'));
	beforeEach(angular.mock.inject(function($controller, _$rootScope_) {
		$rootScope = _$rootScope_;
		$scope = $rootScope.$new();
		$scope.currentUser = {_id: 'abcd1234'};
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
		spyOn($scope, 'loadItem').andCallThrough(); 
		spyOn(localStorageMock, 'retrieve').andReturn(itemMock);
		$scope.editing = true;
		// TODO test opStatus code 
		// $rootScope.opStatus = 'oldStatus';
		// used in spyOn, so needs to be called through
		$scope.loadItem();
		expect(localStorageMock.retrieve).toHaveBeenCalledWith('items', 'todo');
		expect($scope.loadItem).toHaveBeenCalled();
		expect($scope.item._id).toBe('abcd1234');
		expect($scope.editing).toBe(false);
		// TODO expect($rootScope.opStatus).toBe('');
	});

	it('should save an item', function() {
		spyOn(localStorageMock, 'store').andCallThrough();
		$scope.item = itemMock;
		$scope.saveItem();
		expect(localStorageMock.store).toHaveBeenCalledWith({ schema : 'items', name : '#todo', _id : 'abcd1234', user : '1234abcd', clientUpdate : itemMock.clientUpdate, serverUpdate : 5678, content : 'hello world' }, true);
	});

	it('should refresh items where the remote item has been updated most recently', inject(function($q) {
		var deferred = $q.defer();
		spyOn(remoteStorageMock, 'retrieveModifiedSince').andReturn({$promise: deferred.promise});
		// could build a more sophisticated localStorageMock, that returned one of a number of values
		spyOn(localStorageMock, 'retrieve').andReturn({serverUpdate: 1234, clientUpdate: 5678});
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
		spyOn(remoteStorageMock, 'retrieveModifiedSince').andReturn({$promise: deferred.promise});
		// could build a more sophisticated localStorageMock, that returned one of a number of values
		spyOn(localStorageMock, 'retrieve').andReturn({serverUpdate: 1234, clientUpdate: 5678});
		spyOn($rootScope, '$emit');
		// test 2 - client has correct view of server update, but client has been updated more recently offline
		$scope.refreshItems();
		deferred.resolve([{name: '#todo', serverUpdate: 1234}]);
		$rootScope.$digest()
		expect(remoteStorageMock.retrieveModifiedSince).toHaveBeenCalled();
		expect($rootScope.$emit).toHaveBeenCalledWith('localStorageStored', { serverUpdate : 1234, clientUpdate : 5678 });
	}));
});