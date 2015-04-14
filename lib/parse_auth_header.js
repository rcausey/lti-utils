var _ = require('lodash');

module.exports = function(authHeader) {
		if (!_.startsWith(authHeader, 'OAuth ')) {
			return null;
		}

		var re = /([^=\s]+)="([^"]*)"(?:,\s*)?/g;

		var match, parameters = {};
		while ((match = re.exec(authHeader))) {
			parameters[match[1]] = decodeURIComponent(match[2]);
		}

		var hasRequiredParams =
			_.every([
				'oauth_version',
				'oauth_nonce',
				'oauth_timestamp',
				'oauth_body_hash',
				'oauth_signature_method',
				'oauth_signature'
			], function(paramName) {
				return _.has(parameters, paramName);
			});

		return hasRequiredParams ? parameters : null;
	};
