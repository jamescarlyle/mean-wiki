'use strict';

describe('controllers-with-server', function () {
	var ItemDetailCtrl;
	var $scope;
	var $rootScope;
	var routeParamsMock;
	var remoteStorageMock;
	var localStorageMock;
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
		routeParamsMock = {schema: 'items', name:'todo'};
		localStorageMock = {
			// this needs to be defined to return something - anything
			retrieve: function() {return {}},
			store: function() { }
		};
		ItemDetailCtrl = $controller('ItemDetailCtrl', {
			$scope: $scope, $rootScope: $rootScope, $routeParams: routeParamsMock, $location: {}, LocalStorage: localStorageMock
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
		$rootScope.opStatus = 'oldStatus';
		// used in spyOn, so needs to be called through
		$scope.loadItem();
		expect(localStorageMock.retrieve).toHaveBeenCalledWith('items', 'todo');
		expect($scope.loadItem).toHaveBeenCalled();
		expect($scope.item._id).toBe('abcd1234');
		expect($scope.editing).toBe(false);
		expect($rootScope.opStatus).toBe('');
	});

	it('should save an item', function() {
		spyOn(localStorageMock, 'store').andCallThrough();
		$scope.item = itemMock;
		$scope.saveItem();
		expect(localStorageMock.store).toHaveBeenCalledWith({ schema : 'items', name : '#todo', _id : 'abcd1234', user : '1234abcd', clientUpdate : itemMock.clientUpdate, serverUpdate : 5678, content : 'hello world' }, true);
	});
});