var nonce = require('./nonce'),
	oauthSign = require('oauth-sign'),
	_ = require('lodash');

module.exports = {
	launch: function(url, parameters, consumerKey, consumerSecret) {
		var authParams = {
			oauth_callback: 'about:blank',
			oauth_consumer_key: consumerKey,
			oauth_nonce: nonce(),
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: Math.floor((new Date()).getTime() / 1000),
			oauth_version: '1.0'
		};

		authParams.oauth_signature = oauthSign.hmacsign(
			'POST',
			url,
			_.assign(parameters, authParams),
			consumerSecret
		);

		return _.assign(parameters, authParams);
	}
};
