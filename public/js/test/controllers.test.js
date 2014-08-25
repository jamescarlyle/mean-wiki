'use strict';

describe('WikiController', function () {
	var $location, WikiController;
	var $scope;
	var $rootScope;

	beforeEach(angular.mock.module('WikiModule'));

	beforeEach(inject(function($rootScope, $location, $controller) {
		$rootScope = $rootScope;
		$scope = $rootScope.$new();
		$location = $location;
		WikiController = $controller('WikiController', {
			$scope: $scope, $location: $location
		});
		$scope.$digest();

	}));

	it('should load the module', function () {
		expect(WikiModule).toBeDefined;
		expect($scope).toBeDefined;
	});

	it('should have a save page function', function () {
		expect($scope.savePage).toBeDefined();
	});

	it('should save page content to localStorage', function () {
		$scope.pageName = 'test';
		localStorage['wiki_' + $scope.pageName] = '';
		expect(localStorage['wiki_' + $scope.pageName]).toBe('');
		$scope.wikiText = 'some test content';
		$scope.savePage();
		expect(localStorage['wiki_' + $scope.pageName]).toBe('some test content');
	});

	it('should respond to a page change', function () {
		$scope.pageName = 'test';
		expect($scope.pageName).toBe('test');
		expect($scope.$on('$locationChangeSuccess')).toBeDefined;
		expect($rootScope).toBeDefined;
		var newUrl = 'http://foourl.com/wiki.html#hello';
		$scope.$digest(function() {
			$rootScope.$broadcast('$locationChangeSuccess', newUrl);
			expect($scope.pageName).toBe('hello');
		});
		
	});

	it('should load the new page content', function () {
		var newUrl = 'http://foourl.com/wiki.html#hello';
		localStorage['wiki_' + 'hello'] = 'test content';
		$scope.wikiText = '';
		$scope.$digest(function() {
			$rootScope.$broadcast('$locationChangeSuccess', newUrl);
			expect($scope.pageName).toBe('hello');
			expect($scope.wikiText).toBe('test content');
		});
	});

	it('should hide the editing mode when content exists', function () {
		var newUrl = 'http://foourl.com/wiki.html#hello';
		localStorage['wiki_' + 'hello'] = 'test content';
		$scope.wikiText = '';
		$scope.editing = true;
		$scope.$digest(function() {
			$rootScope.$broadcast('$locationChangeSuccess', newUrl);
			expect($scope.editing).toBeFalsy;
		});
	});

	it('should show the editing mode when content doesnt exist', function () {
		var newUrl = 'http://foourl.com/wiki.html#hello';
		localStorage['wiki_' + 'hello'] = '';
		$scope.editing = false;
		$scope.$digest(function() {
			$rootScope.$broadcast('$locationChangeSuccess', newUrl);
			expect($scope.editing).toBeTruthy();
		});
	});
});

describe('wikify filter', function () {
	var wikifyFilter;

	beforeEach(module('WikiModule'));

	beforeEach(inject(function($filter) {
		wikifyFilter = $filter('wikify');
	}));
	
	it('should load the filter', function () {
		expect(wikifyFilter).toBeDefined;
	});

	it('should put plain text in a paragraph', function () {
		expect(wikifyFilter('Hello world')).toBe('<p>Hello world</p>');
	});

	it('should transform a wiki word', function () {
		expect(wikifyFilter('Hello #midwestjs')).toBe('<p>Hello <span class="glyphicon glyphicon-flag"></span> <a href="#midwestjs">#midwestjs</a></p>');
	});

	it('should replace a line break with a new paragraph', function () {
		expect(wikifyFilter('Hello\nworld')).toBe('<p>Hello</p><p>world</p>')
	});
});