var WikiModule = angular.module('WikiModule', ['ngSanitize'])
// filter to convert WikiWords to links
.filter('wikify', function() {
	return function(input) {
		// parse for WikiWords
		var output = (input || '').replace(/([A-Z][a-z]+){2,}/g, function(wikiWord) {
			// add an icon for new items
			return (!localStorage['wiki_' + wikiWord] ? '<span class="glyphicon glyphicon-flag"></span> ' : '') 
				+ '<a ' + 'href="#' + wikiWord + '">' + wikiWord + '</a>';
		});
		// parse for paragraphs, and return
		return '<p>' + output.replace(/\n{2}/g, '</p><p>') + '</p>';
	};
})
.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
})
// configure factory for storage on server
.factory('StorageService', function($http) {
	return {
		get: function(successMethod) {
			return $http.get('http://localhost:8080/items/').success(function(data, status) {
				successMethod(data, status);
			});
		},
		post: function(item, successMethod) {
			return $http.post('http://localhost:8080/items/', item).success(function(data, status) {
				successMethod(data, status);
			});
		},
		put: function(item, successMethod) {
			return $http.put('http://localhost:8080/items/' + item._id, item).success(function(data, status) {
				successMethod(data, status);
			});
		},
		delete: function(item, successMethod) {
			return $http.delete('http://localhost:8080/items/' + item._id).success(function(data, status) {
				successMethod(data, status);
			});
		}
	};
})
.controller('WikiCtlr', function ($scope, $location, StorageService) {
	// save the edited wiki content to the server, and if successful, update local storage
	$scope.saveItem = function () {
		var item = {};
		if ($scope.itemId) { item._id = $scope.itemId; }
		item.name = $scope.itemName;
		item.content = $scope.itemContent;
		if (item._id) {
			StorageService.put(item, function(data, status) {
				localStorage['wiki_' + item.name] = item._id + '_' + item.content;
			});
		} else {
			StorageService.post(item, function(data, status) {
				localStorage['wiki_' + item.name] = data._id + '_' + item.content;
			});
		}
	};
	// // freshen local storage from server
	// $scope.refreshItems = function () {
	// 	StorageService.get(function(data, status) {
	// 		for (i = 0; i < data.length; i++) { 
	// 			localStorage[data[i].name] = data[i].content;
	// 		}
	// 	});
	// };
	// // remove item from server
	// $scope.removeItem = function(item) {
	// 	StorageService.delete(item, function(data, status) {
	// 		$scope.refreshItems();
	// 	});
	// };
	$scope.$on('$locationChangeSuccess', function(event){
		// set the page name from the URL fragment
		$scope.itemName = $location.hash();
		// fetch the page 
		var storedContent = localStorage['wiki_' + $scope.itemName] || '';
		var idx = storedContent.indexOf('_');
		$scope.itemId = storedContent.slice(0, idx) || '';
		$scope.itemContent = storedContent.slice(idx + 1);
		// determine whether we should immediately go into edit mode, if the page does not exist
		$scope.editing = !$scope.itemContent;
	});
})
;