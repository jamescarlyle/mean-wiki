// need to serve the page locally over http, e.g. using python -m SimpleHTTPServer 8000
// need to start selenium via webdriver e.g. webdriver-manager start
// conf.js
exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',
	// chromeOnly true causes direct interaction with Chrome, and webdriver/Selenium is not required
	chromeOnly: true,
	specs: ['spec.js']
}