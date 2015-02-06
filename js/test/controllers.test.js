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
	var syncLocalRemoteMock = {
		refreshItems: function() {}
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
			$scope: $scope, $rootScope: $rootScope, Configuration: configurationMock, RemoteStorage: remoteStorageMock, LocalStorage: localStorageMock, SyncLocalRemote: syncLocalRemoteMock
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
		spyOn(window.Date, 'now').and.callFake(function() {
			return 2345;
		});
		spyOn(localStorageMock, 'store').and.callThrough();
		$rootScope.online = true;
		$scope.item = itemMock;
		$scope.saveItem();
		expect(localStorageMock.store).toHaveBeenCalledWith({ schema : 'items', name : '#todo', id : 'abcd1234', user_id : 'abcd1234', clientUpdate : 2345, serverUpdate : 5678, content : 'hello world' }, true);
	});
});