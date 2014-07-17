angular.module('wikiServices', [])
// service for Items
.service('RemoteStorage', function(Item, Message, LocalStorage) {
	// the function is the constructor - return an map of function names and the function provided
	return {
		store: function(resourceItem) {
			// hold the previous updated timestamp, in case we need to revert to it in the event of failure
			var previousUpdate = resourceItem.serverUpdate;
			resourceItem.serverUpdate = Date.now();
			// if _id exists, already saved on server, so PUT update, otherwise POST an insert
			(resourceItem._id? resourceItem.$update() : resourceItem.$save())
			.then(function() {
				Message.success('Item was saved successfully');
				resourceItem.clientUpdate = resourceItem.serverUpdate;
			})
			.catch(function() { 
				Message.failure('Item was not saved successfully - are you offline?');
				resourceItem.serverUpdate = previousUpdate;
				resourceItem.clientUpdate = Date.now();
			})
			.finally(function() {
				// store locally even if the call to the remote server did not succeed
				LocalStorage.store(resourceItem);
			});
		},
		remove: function(resourceItem) {
			resourceItem.delete()
			.then(function() {
				Message.success('Item deleted successfully');
			})
			.catch(function() { 
				Message.failure('Item was not saved successfully - are you offline?');
			});
		}
	};
})
.service('LocalStorage', function(Item, Message) {
	// the function is the constructor - return an map of function names and the function provided
	return {
		store: function(resourceItem) {
			// serialise the passed object and store locally
			localStorage[resourceItem.name] = JSON.stringify({
				_id: resourceItem._id, 
				clientUpdate: resourceItem.clientUpdate,
				serverUpdate: resourceItem.serverUpdate,
				content: resourceItem.content
			});
		},
		retrieve: function(itemName) {
			// deserialises and returns an item object - populated or empty
			var resourceItem = new Item();
			angular.extend(resourceItem, JSON.parse(localStorage[itemName] || '{}'));
			resourceItem.name = itemName;
			return resourceItem;
		}
	};
})
;