angular.module('authenticate', ['resources'])
// service for User authentication
.service('Authenticate', ['User', 'Message', '$window', function(User, Message, $window) {
	this.login = function(user) {
		// request user object and force that to require Basic authentication
		return User.get({emailAddress: user.emailAddress}, this.successMessage, this.failureMessage);
	};
	this.logout = function() {
		Message.success('You logged out successfully');
	};
	// originally this.successMessage was not defined separately - it was specified inline in this.login method, but User.get is tested as a mock object and the inline code was not defined
	this.successMessage = function(user) {
		if (user.id) {
			Message.success('You logged in successfully');
		} else {
			Message.failure('Your login was not successful. Please try again');
			// TODO bug - should resolve the promise as failed here, then the calling .then() would not be executed
		}
	};
	this.failureMessage = function() {
		Message.failure('There was a problem. Please try again');
	};
	this.encode = function(string) {
		// encode the String
		return $window.btoa(string);
	}
	this.utfEncode = function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	}
 
}])
;