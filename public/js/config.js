angular.module('config', [])
// service for configuration
.service('Configuration', function() {
	this.getModifiedSince = function() {
		return parseInt(localStorage['$serverUpdate'], 10);
	};
	this.setModifiedSince = function(serverUpdate) {
		localStorage['$serverUpdate'] = (serverUpdate).toString(10);
	};
})
;