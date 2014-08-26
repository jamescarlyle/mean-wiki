angular.module('remoteStorage', ['resources'])
// service for Items
.service('RemoteStorage', ['Item', 'Message', '$rootScope', function(Item, Message, $rootScope) {
	// the function is the constructor - return an map of function names and the function provided
	var store = function(resourceItem, raiseEvent) {
		// hold the previous updated timestamp, in case we need to revert to it in the event of failure
		var previousUpdate = resourceItem.serverUpdate;
		// hold the schema, as this is not being persisted and will not be returned
		// var schema = resourceItem.schema;
		// set the server update time to be the same as the client last update
		resourceItem.serverUpdate = resourceItem.clientUpdate;
		// if _id exists, already saved on server, so PUT update, otherwise POST an insert
		(resourceItem._id? resourceItem.$update() : resourceItem.$save())
		.then(function() {
			// TODO not posting this feels odd, but posting feels odd too : maybe just parse name (which is posted!) 
			// resourceItem.schema = schema;
			Message.success('Item was saved remotely');
			// set client update to be same as server, so item shows as synchronised
			// TODO not necessary since time set on client, not server 
			// resourceItem.clientUpdate = resourceItem.serverUpdate;
			// raise an event for remote storage, so the remote time can be updated in local storage and syncStatus shows synchronised
			if (raiseEvent == true) { 
				$rootScope.$emit('remoteStorageStored', resourceItem); 
			};
		})
		.catch(function() { 
			// resourceItem.schema = schema;
			Message.failure('Item was not saved remotely');
			// roll back the server update as update did not go through
			resourceItem.serverUpdate = previousUpdate;
		})
	};
	this.store = store;
	var remove = function(resourceItem) {
		resourceItem.$remove()
		.then(function() {
			Message.success('Item deleted successfully');
		})
		.catch(function() {
			Message.failure('Item was not deleted');
		})
	};
	this.remove = remove;
	// TODO - should RemoteStorage methods take Resources as parameter? Or _id?
	this.retrieveOne = function(schema, _id) {
		// this returns a promise
		return Item.get({schema: schema, _id: _id});
	};
	this.retrieveModifiedSince = function(schema, modifiedSince) {
		// this returns a promise
		return Item.queryModifiedSince(schema, modifiedSince);
	};
	$rootScope.$on('localStorageStored', function(event, data) {
		// listen for local storage events and replicate remotely
		if ($rootScope.online) {
			store(data, true);
		}
	});	
	$rootScope.$on('localStorageRemoved', function(event, data) {
		// listen for local storage events and replicate remotely
		if ($rootScope.online) {
			remove(data, true);
		}
	});
}])
;