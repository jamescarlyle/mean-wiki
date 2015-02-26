angular.module('resources', ['ngResource', 'static'])
// service for Items
.factory('User', ['$http', '$resource', 'SERVER_URL', function($http, $resource, SERVER_URL) { 
	return $resource(SERVER_URL + 'users/:id', {id:'@id'}, {
		update: { method: 'PUT' }
	});
}])
// service for Items
.factory('Item', ['$http', '$resource', 'SERVER_URL', function($http, $resource, SERVER_URL) { 
	var lastCheck = 0;
	var getSyncStatus = function(clientUpdate, serverUpdate) {
		if (!clientUpdate) {
				return {status:'flash', message:'not saved'};
			} else if (serverUpdate && serverUpdate > clientUpdate) {
				return {status:'save', message:'needs to be refreshed locally'};
			} else if (!serverUpdate || serverUpdate < clientUpdate) {
				return {status:'open', message:'needs to be saved remotely'};
			} else return {status:'saved', message:'synchronised'}; ;
	}
	var getSchema = function(name) {
		return {'#':'items','@':'people'}[name.charAt(0)];
	}
	var getSummary = function(item) {
		return {schema: getSchema(item.name), name: item.name.substr(1), syncStatus: getSyncStatus(item.clientUpdate, item.serverUpdate)};
	}
	// use the id of the object to pass as a query parameter in the appropriate placeholder, and parameterise the schema (without a default)
	var Item = $resource(SERVER_URL + 'users/:user_id/:schema/:id', {user_id: '@user_id', schema: '@schema', id:'@id'}, {
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
	// make getsyncstatus and schema available on the resource
	Item.getSyncStatus = getSyncStatus;
	Item.getSchema = getSchema;
	Item.getSummary = getSummary;
	// provide a query on the resource that allows all items since the last time the query was run to be fetched
	Item.queryModifiedSince = function(user_id, schema, modifiedSince) {
		lastCheck = modifiedSince;
		return Item.queryModified({user_id: user_id, schema: schema});
	}
	Object.defineProperties(Item.prototype, {
		// determine schema from name: curly brackets define object with key/value properties, array specifies getter for key
		'schema': { get : function() { return getSchema(this.name) } },
		// determine syncStatus property by server and client update
		'syncStatus': { get : function() { return getSyncStatus(this.clientUpdate, this.serverUpdate); }},
		'asString': { get : function() {
			if (this.schema == "items") {
			return JSON.stringify({
				id: this.id, 
				clientUpdate: this.clientUpdate,
				serverUpdate: this.serverUpdate,
				content: this.content
			});
		} else {
			return JSON.stringify({
				id: this.id, 
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
		}},
		'summary': { get : function() { return getSummary(this); }}
	});
	return Item;
}])
.config(['$resourceProvider', function($resourceProvider) {
	$resourceProvider.defaults.stripTrailingSlashes = false;
}])
;