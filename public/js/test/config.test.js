'use strict';

describe('config module', function () {
	var Configuration;

	beforeEach(angular.mock.module('config'));

	beforeEach(angular.mock.inject(function(_Configuration_) {
		Configuration = _Configuration_;
	}));

	it('should have a Configuration singleton', function () {
		expect(Configuration).toBeDefined;
	});

	it('should return the 0 as the last update time, if no value has been set', function (done) {
		localStorage.removeItem('$serverUpdate');
		expect(Configuration.getModifiedSince()).toBe(0);
		done();
	});

	it('should return the last updated time', function (done) {
		localStorage['$serverUpdate'] = (1234).toString(10);
		expect(Configuration.getModifiedSince()).toBe(1234);
		done();
	});

	it('should store the last updated time', function (done) {
		Configuration.setModifiedSince(1234);
		expect(localStorage['$serverUpdate']).toBe((1234).toString(10));
		done();
	});
	
});