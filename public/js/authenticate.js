angular.module('authenticate', ['resources'])
// service for Items
.service('Authenticate', ['User', 'Message', function(User, Message) {
	this.login = function(user) {
		return User.get({emailAddress: user.emailAddress, passwordHash: user.passwordHash}, function(user) {
			if (user._id) {
				Message.success('You logged in successfully');
			} else {
				Message.failure('You failed to log in');
			}
		}, function() {
			Message.failure('There was a problem. Please try again');
		});
	};
	this.logout = function() {
		Message.success('You logged out successfully');
	};
}])
;