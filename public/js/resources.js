angular.module('resources', ['ngResource'])
// service for Items
.factory('User', ['$http', '$resource', function($http, $resource) { 
	return $resource('http://localhost:8080/wiki/users/:id', {id:'@id'}, {
		update: { method: 'PUT' }
	});
}])
// service for Items
.factory('Item', ['$http', '$resource', function($http, $resource) { 
	var lastCheck = 0;
	// use the id of the object to pass as a query parameter in the appropriate placeholder, and parameterise the schema (without a default)
	var Item = $resource('http://localhost:8080/wiki/users/:user_id/:schema/:id', {user_id: '@user_id', schema: '@schema', id:'@id'}, {
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
	Item.queryModifiedSince = function(user_id, schema, modifiedSince) {
		lastCheck = modifiedSince;
		return Item.queryModified({user_id: user_id, schema: schema});
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
		}},
		'asString': { get : function() {
			if (this.schema == "items") {
			return JSON.stringify({
				id: this.id, 
				// user_id: this.user_id,
				clientUpdate: this.clientUpdate,
				serverUpdate: this.serverUpdate,
				content: this.content
			});
		} else {
			return JSON.stringify({
				id: this.id, 
				// user_id: this.user_id,
				clientUpdate: this.clientUpdate,
				serverUpdate: this.serverUpdate,
				emailAddress: this.emailAddress,
				mobileTelephone: this.mobileTelephone,
				homeAddress: this.homeAddress,
				twitterHandle: this.twitterHandle,
				facebook: this.facebook,
				notes: this.notes
			});
		}
		}}
	});
	return Item;
}])
.config(['$resourceProvider', function($resourceProvider) {
	$resourceProvider.defaults.stripTrailingSlashes = false;
}])
;