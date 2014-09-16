angular.module('localStorage', ['resources'])
.service('LocalStorage', ['Item', 'Message', '$rootScope', function(Item, Message, $rootScope) {
	var store = function(resourceItem, raiseEvent) {
		// serialise the passed object and store locally
		localStorage[resourceItem.name] = resourceItem.asString;
		// if offline, alert that item was saved locally (online saved message will come from RemoteStorage)
		if ($rootScope.online == false) {
			Message.success('Item was saved locally'); 
		};
		// if ($rootScope.online == false) { Message.success('Item was saved locally'); };
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
		// TODO replace this with map
		resourceItem.name = (schema == 'items' ? '#' : '@') + itemName;
		// resourceItem.schema = schema;
		angular.extend(resourceItem, JSON.parse(localStorage[resourceItem.name] || '{}'));
		return resourceItem;
	};
	this.retrieveAll = function() {
		var items = [];
		var item = new Item;
		var regExp = /([#\@])(\w+)/;
		var match, key;
		for (i = 0; i < localStorage.length; i++) {
			key = localStorage.key(i);
			match = regExp.exec(key);
			if (match) {
				angular.extend(item, JSON.parse(localStorage[key] || '{}'));
				items.push({schema: {'#':'items','@':'people'}[match[1]], symbol: match[1], name: match[2], syncStatus: item.syncStatus});
			}
		}
		return items;
	};
	$rootScope.$on('remoteStorageStored', function(event, data) {
		// listen for remote storage events and update so that remote update time stored locally
		store(data, false);
	});	
}])
;