var _ = require('lodash'),
	oauthSign = require('oauth-sign');

module.exports = {
	launch: function(method, url, parameters, consumerKey, consumerSecret) {
		var authParams = this.authorize(method, url, parameters, consumerKey, consumerSecret);

		return _.assign(parameters, authParams);
	},
	authorize: function(method, url, parameters, consumerKey, consumerSecret) {
		var params = _.assign(parameters, {
			oauth_callback: 'about:blank',
			oauth_consumer_key: consumerKey,
			oauth_nonce: this.nonce(),
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: Math.floor((new Date()).getTime() / 1000),
			oauth_version: '1.0'
		});

		return {
			oauth_callback: params.oauth_callback,
			oauth_consumer_key: params.oauth_consumer_key,
			oauth_nonce: params.oauth_nonce,
			oauth_signature: this.sign(method, url, parameters, consumerSecret),
			oauth_signature_method: params.oauth_signature_method,
			oauth_timestamp: params.oauth_timestamp,
			oauth_version: params.oauth_version
		};
	},
	sign: function(method, url, parameters, consumerSecret) {
		if (parameters.oauth_signature_method != 'HMAC-SHA1') {
			throw new Error('Provided signature method is not supported. Only HMAC-SHA1 is supported as a signature method.');
		}

		return oauthSign.hmacsign(method, url, parameters, consumerSecret);
	},
	nonce: function() {
		var base64 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
			results = [];

		for (var i = 0; i <= 31; i++) {
			results.push(base64[_.random(0, base64.length - 1)]);
		}

		return results.join('');
	}
};
