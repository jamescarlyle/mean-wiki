'use strict';

describe('controllers', function () {
	var ApplicationCtrl, AuthenticateCtrl;
	var $appScope, $authScope;
	var $rootScope;
	var authenticateMock = {
		login: function() {} // return {$promise: {then: function() {}}} 
	};

	beforeEach(angular.mock.module('controllers'));
	beforeEach(angular.mock.inject(function($controller, _$rootScope_) {
		$rootScope = _$rootScope_;
		$appScope = $rootScope.$new();
		ApplicationCtrl = $controller('ApplicationCtrl', {
			$scope: $appScope
		});
		$authScope = $appScope.$new();
		AuthenticateCtrl = $controller('AuthenticateCtrl', {
			$scope: $authScope, $location: {}, Authenticate: authenticateMock
		});
	}));

	it('should login a user', inject(function($q) {
		var user = {_id: 'abcd1234', emailAddress: 'j@j.com', passwordHash: 'xyz'};
		var deferred = $q.defer();

		spyOn(authenticateMock, 'login').and.returnValue({$promise: deferred.promise});
		$authScope.login(user);
		deferred.resolve(user); 
		$rootScope.$apply();  

		expect($scope.currentUser).toBe(user);
	}));
});