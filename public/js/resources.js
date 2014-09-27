angular.module('resources', ['ngResource'])
// service for Items
.factory('User', ['$http', '$resource', function($http, $resource) { 
	return $resource('http://localhost:8080/wiki/users/:_id', {_id:'@_id'}, {
		update: { method: 'PUT' }
	});
}])
// service for Items
.factory('Item', ['$http', '$resource', function($http, $resource) { 
	var lastCheck = 0;
	// use the _id of the object to pass as a query parameter in the appropriate placeholder, and parameterise the schema (without a default)
	var Item = $resource('http://localhost:8080/wiki/users/:user/:schema/:_id', {user: '@user', schema: '@schema', _id:'@_id'}, {
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
	Item.queryModifiedSince = function(user, schema, modifiedSince) {
		lastCheck = modifiedSince;
		return Item.queryModified({user: user, schema: schema});
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
				_id: this._id, 
				user: this.user,
				clientUpdate: this.clientUpdate,
				serverUpdate: this.serverUpdate,
				content: this.content
			});
		} else {
			return JSON.stringify({
				_id: this._id, 
				user: this.user,
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