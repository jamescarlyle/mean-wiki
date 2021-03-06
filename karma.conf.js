// Karma configuration
// Generated on Wed Jul 30 2014 16:25:51 GMT+0100 (BST)

module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: 'public',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine'],


		// list of files / patterns to load in the browser
		files: [
			// libraries
			'lib/angular.min.js',
			// 'lib/angular.js',
			'lib/angular-mocks.js',
			'lib/angular-sanitize.min.js',
			'lib/angular-route.min.js',
			'lib/angular-resource.min.js',
			// code files
			'js/app.js',
			'js/static.js',
			'js/config.js',
			'js/user-message.js',
			'js/comparison.js',
			'js/filters.js',
			'js/resources.js',
			'js/local-storage.js',
			'js/remote-storage.js',
			'js/user-storage.js',
			'js/authenticate.js',
			'js/controllers.js',
			'js/sync-local-remote.js',
			// test files
			'js/test/app.test.js',
			'js/test/config.test.js',
			'js/test/user-message.test.js',
			'js/test/filters.test.js',
			'js/test/resources.test.js',
			'js/test/local-storage.test.js',
			'js/test/remote-storage.test.js',
			'js/test/user-storage.test.js',
			'js/test/authenticate.test.js',
			'js/test/controllers.test.js',
			'js/test/authenticate-controller.test.js',
			'js/test/sync-local-remote.test.js'
		],

		// list of files to exclude
		exclude: [
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			// '**/*.html': ['ng-html2js']
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_WARN,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		plugins: [
			'karma-chrome-launcher',
			'karma-jasmine'
		],


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		// browsers: ['PhantomJS'],
		browsers: ['Chrome'],


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true
	});
};
