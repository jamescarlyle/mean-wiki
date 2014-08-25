angular.module('resources', ['ngResource'])
// service for Items
.factory('Item', function($http, $resource) { 
	var lastCheck = 0;
	// use the _id of the object to pass as a query parameter in the appropriate placeholder, and parameterise the schema (without a default)
	var Item = $resource('http://localhost:8080/wiki/users/53e56a9e4938931d944740a3/:schema/:_id', {schema: '@schema', _id:'@_id'}, {
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
	// provide a query on the resource that allows all items since the last time the query was run to be fetched
	// TODO is this in use?
	Item.queryModifiedSince = function(modifiedSince) {
		lastCheck = modifiedSince;
		return Item.queryModified();
	}
	Object.defineProperties(Item.prototype, {
		// determine schema from name: curly brackets define object with key/value properties, array specifies getter for key
		'schema': { get : function() { return {'#':'items','@':'people'}[this.name.charAt(0)]; } },
		// determine syncStatus property by server and client update
		'syncStatus': { get : function() {
			if (!this.clientUpdate) {
				return {status:'flash', message:'not saved'};
			} else if (this.serverUpdate && this.serverUpdate > this.clientUpdate) {
				return {status:'save', message:'needs to be refreshed locally'};
			} else if (!this.serverUpdate || this.serverUpdate < this.clientUpdate) {
				return {status:'open', message:'needs to be saved remotely'};
			} else return {status:'saved', message:'synchronised'}; ;
		}}
	});
	return Item;
})
.config(['$resourceProvider', function($resourceProvider) {
	$resourceProvider.defaults.stripTrailingSlashes = false;
}])
;