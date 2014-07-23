angular.module('wikiResources', ['ngResource'])
// service for Items
.factory('Item', function($http, $resource) { 
	var lastCheck = 0;
	var Item = $resource('http://localhost:8080/items/:_id', {_id:'@_id'}, {
		update: { 
			method: 'PUT' 
		},
		queryModified: {
			method: 'GET',
			isArray: true,
			transformRequest: function(data, headersGetter) {
				headersGetter()['If-Modified-Since'] = lastCheck;
			}
		}
	});
	Item.queryModifiedSince = function(modifiedSince) {
		lastCheck = modifiedSince;
		return Item.queryModified();
	}
	Item.prototype.getSyncStatus = function() {
		if (!this.clientUpdate) {
			return {status:'flash', message:'not saved'};
		} else if (this.serverUpdate && this.serverUpdate > this.clientUpdate) {
			return {status:'save', message:'needs to be refreshed locally'};
		} else if (!this.serverUpdate || this.serverUpdate < this.clientUpdate) {
			return {status:'open', message:'needs to be saved remotely'};
		} else return {status:'saved', message:'synchronised'}; ;
	};
	return Item;
})
.config(['$resourceProvider', function($resourceProvider) {
	$resourceProvider.defaults.stripTrailingSlashes = false;
}]);