var webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');


module.exports = function() {
	test.it('表示画面共通テスト', function() {
		var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
		driver.get('http://localhost:8080/');
		driver.findElement(webdriver.By.id('a'));
		driver.quit();
	});
};