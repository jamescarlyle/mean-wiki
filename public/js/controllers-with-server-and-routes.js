var wikiControllers = angular.module('wikiControllers', ['ngSanitize'])
// filter to convert WikiWords to links
.filter('wikify', function() {
	return function(input) {
		// parse for WikiWords
		var output = (input || '').replace(/([A-Z][a-z]+){2,}/g, function(wikiWord) {
			// add an icon for new items
			return (!localStorage['wiki_' + wikiWord] ? '<span class="glyphicon glyphicon-flag"></span> ' : '') 
				+ '<a ' + 'href="#/items/' + wikiWord + '">' + wikiWord + '</a>';
		});
		// parse for paragraphs, and return
		return '<p>' + output.replace(/\n{2}/g, '</p><p>') + '</p>';
	};
})
.factory('StorageService', function($http) {
	return {
		get: function(successMethod, errorMethod) {
			return $http.get('http://localhost:8080/items/').success(function(data, status) {
					successMethod(data, status);
				})
				.error(function(status) {
					errorMethod(status);
				});
		},
		post: function(item, successMethod, errorMethod) {
			return $http.post('http://localhost:8080/items/', item).success(function(data, status) {
					successMethod(data, status);
				})
				.error(function(status) {
					errorMethod(status);
				});
		},
		put: function(item, successMethod, errorMethod) {
			return $http.put('http://localhost:8080/items/' + item._id, item).success(function(data, status) {
					successMethod(data, status);
				})
				.error(function(status) {
					errorMethod(status);
				});
		},
		delete: function(item, successMethod, errorMethod) {
			return $http.delete('http://localhost:8080/items/' + item._id).success(function(data, status) {
					successMethod(data, status);
				})
				.error(function(status) {
					errorMethod(status);
				});
		}
	};
})
// .controller('ItemCtrl', function($scope) {
// 	$rootScope.disconnected = false;
// })
.controller('ItemListCtrl', function ($scope, $rootScope, StorageService) {
	// freshen local storage from server - will not overwrite items that have not yet been stored, i.e. additive only
	$scope.refreshItems = function () {
		StorageService.get(function(data, status) {
			$rootScope.disconnected = false;
			for (i = 0; i < data.length; i++) { 
				localStorage['wiki_' + data[i].name] = data[i]._id + '_' + data[i].content;
			}
		}, function(status) { 
			$rootScope.disconnected = true; 
		});
	};
	// now add local storage items to scope
	var items = [];
	for (var storedName in localStorage) {
		var storedContent = localStorage[storedName];
		// get the index of the _id boundary
		var idx = storedContent.indexOf('_');
		// now set up a new item to add
		var itemX = {
			_id: (storedContent.slice(0, idx) || ''),
			content: storedContent.slice(idx + 1),
			// get the substring of the name after 'wiki_'
			name: storedName.slice(5)
		};
		items.push(itemX);
	}
	$scope.items = items;
	// // remove item from server
	// $scope.removeItem = function(item) {
	// 	StorageService.delete(item, function(data, status) {
	// 		$scope.refreshItems();
	// 	});
	// };
})
.controller('ItemDetailCtrl', function ($scope, $rootScope, $routeParams, StorageService) {
	$scope.reloadItem = function () {
		// set the page name from the URL fragment
		$scope.name = $routeParams._id;
		// fetch the page 
		var storedContent = localStorage['wiki_' + $scope.name] || '';
		var idx = storedContent.indexOf('_');
		$scope._id = storedContent.slice(0, idx) || '';
		$scope.content = storedContent.slice(idx + 1);
		// determine whether we should immediately go into edit mode, if the page does not exist
		$scope.editing = !$scope.content;
	};
	// save the edited wiki content to the server, and if successful, update local storage
	$scope.saveItem = function () {
		// create an item to save and set properties
		var item = {};
		item.name = $scope.name;
		item.content = $scope.content;
		if ($scope._id) {
			// _id exists, so already saved on server, so PUT update
			item._id = $scope._id;
			// store locally, regardless of connection
			localStorage['wiki_' + item.name] = item._id + '_' + item.content;
			// now try and store remotely
			StorageService.put(item, function(data, status) {
				$rootScope.disconnected = false;
			}, function(status) { 
				$rootScope.disconnected = true; 
			});
		} else {
			// no _id assigned yet, so not yet saved, so POST new item
			StorageService.post(item, function(data, status) {
				$rootScope.disconnected = false;
				// remote storage succeeded, store locally with remote _id
				localStorage['wiki_' + item.name] = data._id + '_' + item.content;
				$scope._id = data._id;
			}, function(status) { 
				$rootScope.disconnected = true; 
				// remote storage failed, so store locally without _id
				localStorage['wiki_' + item.name] = '_' + item.content;
			});
		}
	};
	$scope.reloadItem();
})
;