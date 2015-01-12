angular.module('userMessage', [])
// filter to convert names to links
// set up a generic error handler
.factory("Message", ['$rootScope', function($rootScope){
	return {
		success: function(caughtMessage) {
			$rootScope.opMessage = caughtMessage;
			$rootScope.opStatus = 'success';
			$rootScope.justSet = true;
		},
		failure: function(caughtMessage) {
			$rootScope.opMessage = caughtMessage;
			$rootScope.opStatus = 'warning';
			$rootScope.justSet = true;
		}
	};
}])
;