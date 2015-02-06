angular.module('remoteStorage', ['resources'])
// service for Items
.service('RemoteStorage', ['Item', 'Message', '$rootScope', function(Item, Message, $rootScope) {
	// the function is the constructor - return an map of function names and the function provided
	var store = function(resourceItem, callback) {
		if ($rootScope.online && resourceItem.user_id) {
			// hold the previous updated timestamp, in case we need to revert to it in the event of failure
			var previousServer = resourceItem.serverUpdate;
			// set the server update time to be the same as the client last update
			resourceItem.serverUpdate = resourceItem.clientUpdate;
			// if id exists, already saved on server, so PUT update, otherwise POST an insert
			(resourceItem.id? resourceItem.$update() : resourceItem.$save())
			.then(function() {
				Message.success('Item was saved remotely');
				// set client update to be same as server, so item shows as synchronised - this is not returned from server, so needs to be readded
				resourceItem.clientUpdate = resourceItem.serverUpdate;
			})
			.catch(function() { 
				Message.failure('Item was not saved remotely');
				// roll back the server update as update did not go through
				resourceItem.serverUpdate = previousServer;
			})
			.finally(function() {
				callback(resourceItem);
			});
		}
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
	// TODO - should RemoteStorage methods take Resources as parameter? Or id?
	this.retrieveOne = function(user_id, schema, id) {
		// this returns a promise
		return Item.get({user_id: user_id, schema: schema, id: id});
	};
	this.retrieveModifiedSince = function(user_id, schema, modifiedSince) {
		// this returns a promise
		return Item.queryModifiedSince(user_id, schema, modifiedSince);
	};
	// $rootScope.$on('localStorageStored', function(event, data) {
	// 	// listen for local storage events and replicate remotely
	// 	if ($rootScope.online && data.user_id) {
	// 		// if online and logged in, store, with an event so that local storage updates with serverUpdate time
	// 		store(data, true);
	// 	}
	// });	
	// $rootScope.$on('localStorageRemoved', function(event, data) {
	// 	// listen for local storage events and replicate remotely
	// 	if ($rootScope.online) {
	// 		remove(data, true);
	// 	}
	// });
}])
;