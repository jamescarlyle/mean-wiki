'use strict';
describe('filter module', function () {
	var wikifyFilter;

	beforeEach(angular.mock.module('app'));

	beforeEach(angular.mock.inject(function($filter) {
		wikifyFilter = $filter('wikify');
	}));
	
	it('should load the filter', function () {
		expect(wikifyFilter).toBeDefined;
	});

	it('should put plain text in a paragraph', function () {
		expect(wikifyFilter('Hello world')).toBe('<p>Hello world</p>');
	});

	it('should transform an item wiki word', function () {
		expect(wikifyFilter('Hello #midwestjs')).toBe('<p>Hello <span class="glyphicon glyphicon-flag"></span> <a href="#/items/midwestjs">#midwestjs</a></p>');
	});

	it('should transform a person wiki word', function () {
		expect(wikifyFilter('Hello @james')).toBe('<p>Hello <span class="glyphicon glyphicon-flag"></span> <a href="#/people/james">@james</a></p>');
	});

	it('should replace a line break with a new paragraph', function () {
		expect(wikifyFilter('Hello\nworld')).toBe('<p>Hello</p><p>world</p>')
	});
});