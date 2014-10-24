angular.module('authenticate', ['resources'])
// service for Items
.service('Authenticate', ['User', 'Message', function(User, Message) {
	// TODO originally this.successMessage was not defined separately - it was specified inline the this.login method, but User.get is tested as a mock object and the inline code was not defined
	this.successMessage = function(user) {
		if (user.id) {
			Message.success('You logged in successfully');
		} else {
			Message.failure('You failed to log in');
			// TODO bug - should resolve the promise as failed here, then the calling .then() would not be executed
		}
	};
	this.failureMessage = function() {
		Message.failure('There was a problem. Please try again');
	};
	this.login = function(user) {
		return User.get({emailAddress: user.emailAddress, passwordHash: user.passwordHash}, this.successMessage, this.failureMessage);
	};
	this.logout = function() {
		Message.success('You logged out successfully');
	};
}])
;