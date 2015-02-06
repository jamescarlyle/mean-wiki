angular.module('syncLocalRemote', ['localStorage', 'remoteStorage'])
.service('SyncLocalRemote', ['Configuration', 'RemoteStorage', 'LocalStorage', function(Configuration, RemoteStorage, LocalStorage) {
	this.refreshItems = function(user, callback) {
		var lastCheck = Configuration.getModifiedSince() || 0;
		// this is set before the fetch, because otherwise there is a small gap between the fetch and now that will not be picked up next time
		Configuration.setModifiedSince(Date.now());
		// get the list of items and people from the server
		['items','people'].forEach(function(schema) {
			RemoteStorage.retrieveModifiedSince(user.id, schema, lastCheck).$promise.then(function(serverItems) {
				for (i = 0; i < serverItems.length; i++) {
					// arange items for comparison
					var remoteItem = serverItems[i];
					var localItem = LocalStorage.retrieveByName(remoteItem.name);
					// retrieveByName returns an empty object if not found, so check for clientUpdate
					// TODO could return null and || with new Resource
					if (!localItem.clientUpdate) {
						// cloned from remote - not local so far - store locally
						remoteItem.clientUpdate = remoteItem.serverUpdate;
						LocalStorage.store(remoteItem, false);
					} else if (localItem.serverUpdate == remoteItem.serverUpdate && localItem.clientUpdate > localItem.serverUpdate) {
						// if local remote is same as remote, and local is ahead of remote, we have a local update not persisted so save remotely and then locally to capture server timestamp
						RemoteStorage.store(localItem, LocalStorage.updateLocalStorage);
					} else if (localItem.serverUpdate < remoteItem.serverUpdate && localItem.clientUpdate == localItem.serverUpdate) {
						// later remote update, and we think we are locally up-to-date : replace local
						remoteItem.clientUpdate = remoteItem.serverUpdate;
						LocalStorage.store(remoteItem, false);
					} else if (localItem.serverUpdate == remoteItem.serverUpdate && localItem.clientUpdate == localItem.serverUpdate) {
						// synced - do nothing
					} else if (localItem.serverUpdate == remoteItem.serverUpdate && localItem.clientUpdate < localItem.serverUpdate) {
						// server times synced, but our copy has fallen behind - should never happen unless our clock behind other client
					} else if (localItem.serverUpdate > remoteItem.serverUpdate && localItem.clientUpdate == localItem.serverUpdate) {
						// should never happen - our previous save overwritten by another client (no local unsaved change)
					} else if (localItem.serverUpdate > remoteItem.serverUpdate && localItem.clientUpdate > localItem.serverUpdate) {
						// should never happen - our previous save overwritten by another client (also local unsaved change)
					} else if (localItem.serverUpdate > remoteItem.serverUpdate && localItem.clientUpdate < localItem.serverUpdate) {
						// should never happen - our previous save overwritten by another client 
					} else if (localItem.serverUpdate < remoteItem.serverUpdate && localItem.clientUpdate > localItem.serverUpdate) {
						// later remote update together with local unsaved change - out of sync - just update local view of remote update time
						localItem.serverUpdate = remoteItem.serverUpdate;
						LocalStorage.store(localItem, false);
					} else if (localItem.serverUpdate < remoteItem.serverUpdate && localItem.clientUpdate < localItem.serverUpdate) {
						// later remote update and our copy has fallen behind - should never happen
					};
				};
			});
		});
		callback();
	};
}])
;