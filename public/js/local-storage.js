angular.module('localStorage', ['resources'])
.service('LocalStorage', function(Item, $rootScope) {
	// need to include RemoteStorage as a dependency, otherwise it won't get instantiated (not called directly except as event listener)
	var store = function(resourceItem, raiseEvent) {
		// serialise the passed object and store locally
		if (resourceItem.schema == "items") {
			localStorage[resourceItem.name] = JSON.stringify({
				_id: resourceItem._id, 
				user: resourceItem.user,
				clientUpdate: resourceItem.clientUpdate,
				serverUpdate: resourceItem.serverUpdate,
				content: resourceItem.content
			});
		} else {
			localStorage[resourceItem.name] = JSON.stringify({
				_id: resourceItem._id, 
				user: resourceItem.user,
				clientUpdate: resourceItem.clientUpdate,
				serverUpdate: resourceItem.serverUpdate,
				emailAddress: resourceItem.emailAddress,
				mobileTelephone: resourceItem.mobileTelephone,
				homeAddress: resourceItem.homeAddress,
				twitterHandle: resourceItem.twitterHandle,
				facebook: resourceItem.facebook,
				notes: resourceItem.notes
			});
		}
		// now emit an event with the resourceItem as object - at this point, no specifcation of schema
		if (raiseEvent) { $rootScope.$emit('localStorageStored', resourceItem); };
	};
	this.store = store;
	var remove = function(resourceItem, raiseEvent) {
		// serialise the passed object and store locally
		localStorage.removeItem(resourceItem.name);
		// now emit an event with the resourceItem as object
		if (raiseEvent) { $rootScope.$emit('localStorageRemoved', resourceItem); };
	};
	this.remove = remove;
	this.retrieve = function(schema, itemName) {
		// deserialises and returns an item object - populated or empty
		var resourceItem = new Item();
		resourceItem.name = (schema == 'items' ? '#' : '@') + itemName;
		// resourceItem.schema = schema;
		angular.extend(resourceItem, JSON.parse(localStorage[resourceItem.name] || '{}'));
		return resourceItem;
	};
	$rootScope.$on('remoteStorageStored', function(event, data) {
		// listen for remote storage events and update so that remote update time stored locally
		store(data, false);
	});	
})
;