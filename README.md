mean-wiki
=========
This is an implementation of a number of technologies - the MEAN stack.
It is full of bugs and is very fluid, so feel free to observe but I recommend not using this code until it is more formally tested

Running servers
1. mongod -config /usr/local/etc/mongod.conf
2. node wiki-server-with-people.js
3. python3 -m http.server or python -m SimpleHTTPServer 80

Running tests (I'll figure out .md syntax later)

1. Unit tests
a. Export CHROME_BIN=/usr/bin/chromium-browse
b. From the project root, "karma start karma.conf.js"

2. E2E tests
a. From the project root, start Selenium with "webdriver-manager start"
b. From the tests directory, start Protractor tests with "protractor conf.js" - will run the tests in spec.js
