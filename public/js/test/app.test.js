'use strict';

describe('app module', function () {

	var message;

	beforeEach(angular.mock.module('app'), function($provide) {
		$provide.value('$window', {location:{href:'dummy'}});
	});

	beforeEach(inject(function(Message) {
		message = Message;
	}));

	// TODO refactor this to message.test.js
	it('should have a Message singleton', function () {
		expect(message).toBeDefined;
		inject(function($rootScope) {
			message.success('test success');
			expect($rootScope.opMessage).toBe('test success');
			expect($rootScope.opStatus).toBe('success');
			message.failure('test warning');
			expect($rootScope.opMessage).toBe('test warning');
			expect($rootScope.opStatus).toBe('warning');
		});
	});

	it('should route to the item detail if a schema and item name are provided', function () {
		// we could also load the page this way: module('.public/views/items-detail.html'); preprocessors: {// '**/*.html': ['ng-html2js']},
		inject(function($route, $location, $rootScope, $httpBackend) {
			expect($route.current).toBeUndefined();
			$httpBackend.expectGET('/views/items-detail.html').respond(200);
			$location.path('/items/todo');
			$rootScope.$digest();
			expect($route.current.templateUrl({schema: 'items'})).toBe('/views/items-detail.html');
			expect($route.current.controller).toBe('ItemDetailCtrl');			
		});
	});
	
	it('should route to the item detail if a schema only is provided', function () {
		// we could also load the page this way: module('.public/views/items-detail.html'); preprocessors: {// '**/*.html': ['ng-html2js']},
		inject(function($route, $location, $rootScope, $httpBackend) {
			expect($route.current).toBeUndefined();
			$httpBackend.expectGET('/views/items-list.html').respond(200);
			$location.path('/items');
			$rootScope.$digest();
			expect($route.current.templateUrl({schema: 'items'})).toBe('/views/items-list.html');
			expect($route.current.controller).toBe('ItemListCtrl');			
		});
	});

	it('should track online status', function () {
		inject(function($window, $rootScope) {
			// spy on the $apply method of $rootScope - need to call through, otherwise the rootScope.online property won't be set
			spyOn($rootScope, '$apply').andCallThrough();
			// initial expectation
			expect($rootScope.online).toBe(navigator.onLine);
			// set initial state
			$rootScope.online = true;
			var event = new Event('offline');
			$window.dispatchEvent(event);
			expect($rootScope.online).toBe(false);
			// now check the spy
			expect($rootScope.$apply).toHaveBeenCalled();
			var event = new Event('online');
			$window.dispatchEvent(event);
			expect($rootScope.online).toBe(true);
		})		
	});
	
});