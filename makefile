test:
	mocha --recursive --watch --require ./public/lib/angular.min.js --reporter list ./public/js/test/*.test.js
.PHONY: test