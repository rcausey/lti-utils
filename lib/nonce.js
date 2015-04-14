var _ = require('lodash');

module.exports = function() {
	var base64 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
		results = [];

	for (var i = 0; i <= 31; i++) {
		results.push(base64[_.random(0, base64.length - 1)]);
	}

	return results.join('');
};