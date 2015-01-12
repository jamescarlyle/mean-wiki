angular.module('userStorage', ['resources'])
.service('UserStorage', ['User', 'Message', function (User, Message) {
	this.store = function (user) {
		(user.id ? user.$update() : user.$save())
		.then(function () {
			Message.success('Your user record was saved successfully');
		})
		.catch(function () {
			Message.failure('There was a problem saving your user record. Please try again');
		});
	};
	this.retrieve = function (id) {
		return User.get({id: id});
	};
	this.retrieveByEmailAddress = function (emailAddress) {
		return User.get({emailAddress: emailAddress});
	};
}]);