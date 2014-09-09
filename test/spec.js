// spec.js
describe('Mean Wiki homepage', function() {

	beforeEach(function() {
		browser.get('http://localhost:8000/wiki-with-server.html#/items/test001');
	});

	it('should have a title and a welcome message, and load content', function() {
		expect(browser.getTitle()).toEqual('Mean Wiki');
		expect(element(by.binding('item.schema')).getText()).toEqual('items');
		expect(element(by.binding('item.name')).getText()).toEqual('#test001');
		expect(element(by.binding('item.syncStatus.message')).getText()).toEqual('not saved');
	});

	it('should switch to editing mode and show a blank form for a new item', function () {
		expect(element(by.model('item.content')).getText()).toBe('');
		expect(element(by.binding('item.content | wikify')).getText()).toBe('');
		expect(element(by.buttonText('save')).isDisplayed()).toBe(true);
		expect(element(by.buttonText('edit')).isDisplayed()).toBe(false);
	});

	it('should save and then display the content of the item', function () {
		element(by.model('item.content')).sendKeys('hello world');
		expect(element(by.buttonText('save')).isDisplayed()).toBe(true);
		element(by.buttonText('save')).click();
		expect(element(by.binding('item.content | wikify')).getText()).toBe('hello world');
		expect(element(by.buttonText('save')).isDisplayed()).toBe(false);
		expect(element(by.buttonText('edit')).isDisplayed()).toBe(true);
	});

	it('should display the content of the item previously saved', function () {
		expect(element(by.binding('item.content | wikify')).getText()).toBe('hello world');
	});

	it('should go offline and allow a local save, then online and allow a remote save', function () {
		browser.executeScript("var event = new Event('offline');window.dispatchEvent(event);");
		element(by.buttonText('edit')).click();
		element(by.buttonText('save')).click();
		expect(element(by.binding('item.syncStatus.message')).getText()).toBe('needs to be saved remotely');
		expect(element(by.binding('opMessage')).getText()).toBe('success Item was saved locally');
		browser.executeScript("var event = new Event('online');window.dispatchEvent(event);");
		element(by.buttonText('edit')).click();
		element(by.buttonText('save')).click();
		expect(element(by.binding('item.syncStatus.message')).getText()).toBe('synchronised');
		expect(element(by.binding('opMessage')).getText()).toBe('success Item was saved remotely');
	});

});