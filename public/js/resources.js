angular.module('wikiResources', ['ngResource'])
// service for Items
.factory('Item', function($resource) { 
	return $resource('http://localhost:8080/items/:_id', {_id:'@_id'}, {
		update: { 
			method: 'PUT' 
		},
		queryHead: {
			method: 'HEAD'
		}
	});
})
.config(['$resourceProvider', function($resourceProvider) {
	$resourceProvider.defaults.stripTrailingSlashes = false;
}]);