angular.module('config', [])
// service for configuration
.service('Configuration', function() {
	this.getModifiedSince = function() {
		// return 0 if $serverUpdate has never been set
		return parseInt(localStorage['$serverUpdate'] || 0, 10);
	};
	this.setModifiedSince = function(serverUpdate) {
		localStorage['$serverUpdate'] = (serverUpdate).toString(10);
	};
})
;