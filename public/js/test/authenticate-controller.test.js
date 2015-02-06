'use strict';

describe('controllers', function () {
	var ApplicationCtrl, AuthenticateCtrl;
	var $appScope, $authScope;
	var $rootScope;
	var authenticateMock = {
		login: function() {},
		encode: function() {}
	};
	var locationMock = {
		path: function() {} 
	};
	var httpMock = {
		defaults : { headers : { common : {} } }
	};

	beforeEach(angular.mock.module('app'));
	beforeEach(angular.mock.module('controllers'));
	beforeEach(angular.mock.inject(function($controller, _$rootScope_) {
		$rootScope = _$rootScope_;
		$appScope = $rootScope.$new();
		$appScope.currentUser = {};
		$appScope.setCurrentUser = function(user) { this.currentUser = user };
		ApplicationCtrl = $controller('ApplicationCtrl', {$scope: $appScope});
		$authScope = $appScope.$new();
		AuthenticateCtrl = $controller('AuthenticateCtrl', {
			$scope: $authScope, $location: locationMock, $http: httpMock, Authenticate: authenticateMock
		});
	}));

	it('should login a user', inject(function($q) {
		var user = {id: 'abcd1234', emailAddress: 'j@j.com', password: 'xyz'};
		var deferred = $q.defer();

		spyOn(authenticateMock, 'login').and.returnValue({$promise: deferred.promise});
		spyOn(authenticateMock, 'encode').and.returnValue('abc');
		spyOn(locationMock, 'path');
		$authScope.login(user);
		deferred.resolve(user); 
		$rootScope.$apply();  

		expect($appScope.currentUser).toBe(user);
		expect(httpMock.defaults.headers.common['Authorization']).toBe('Basic abc');
		expect(locationMock.path).toHaveBeenCalledWith('/items/');
	}));
});