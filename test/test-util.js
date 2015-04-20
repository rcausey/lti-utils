var fs = require('fs'),
	BPromise = require('bluebird');

BPromise.promisifyAll(fs);

module.exports = {
	readSampleXml: function(fileName) {
		return fs.readFileAsync(
			__dirname + '/../test_files/' + fileName, 
			'utf-8'
		);
	},
	testNonce: function(nonce) {
		return /[0-9A-Za-z]{32}/.test(nonce);
	},
	testTimestamp: function(timestamp) {
		return /[0-9]{10}/.test(timestamp);
	}
};