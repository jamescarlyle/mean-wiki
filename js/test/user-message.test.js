'use strict';

describe('message module', function () {

	var message;

	beforeEach(angular.mock.module('userMessage'), function($provide) {
		$provide.value('$window', {location:{href:'dummy'}});
	});

	beforeEach(inject(function(Message) {
		message = Message;
	}));

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

});