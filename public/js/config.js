angular.module('config', [])
// service for configuration
.service('Configuration', function() {
	this.getModifiedSince = function() {
		return localStorage['$serverUpdate'];
	};
	this.setModifiedSince = function(serverUpdate) {
		localStorage['$serverUpdate'] = serverUpdate;
	};
})
;