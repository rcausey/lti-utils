var _ = require('lodash'),
	oauthSign = require('oauth-sign'),
	crypto = require('crypto'),
	xml2js = require('xml2js'),
	BPromise = require('bluebird'),
	uuid = require('node-uuid');

module.exports = {
	launch: function(url, parameters, consumerKey, consumerSecret) {
		var authParams = this.authorize('POST', url, parameters, consumerKey, consumerSecret);

		return _.assign(parameters, authParams);
	},
	authorize: function(method, url, parameters, consumerKey, consumerSecret) {
		var oauthParams = {
			oauth_callback: 'about:blank',
			oauth_consumer_key: consumerKey,
			oauth_nonce: this.nonce(),
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: Math.floor((new Date()).getTime() / 1000),
			oauth_version: '1.0'
		};

		oauthParams['oauth_signature'] = this.sign(
				method,
				url,
				_.assign(parameters, oauthParams),
				consumerSecret);

		return oauthParams;
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
	},
	parseAuthHeader: function(authHeader) {
		if (!_.startsWith(authHeader, 'OAuth ')) {
			return null;
		}

		var re = /([^=\s]+)="([^"]*)"(?:,\s*)?/g;

		var match, parameters = {};
		while (match = re.exec(authHeader)) {
			parameters[match[1]] = match[2];
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

			console.dir(parameters);
		return hasRequiredParams ? parameters : null;
	},
	validBodyHash: function(bodyHash, body) {
		var computedBodyHash = crypto.
			createHash('sha1').
			update(body).
			digest('base64');

		console.dir(computedBodyHash);

		return computedBodyHash !== bodyHash;
	},
	requestTypes: {
		replace: 'replace',
		read: 'read',
		delete: 'delete'
	},
	codeMajor: {
		success: 'success',
		failure: 'failure',
		unsupported: 'unsupported'
	},
	severity: {
		status: 'status',
		warning: 'warning',
		error: 'error'
	},
	parseBody: function(body) {
		var self = this;

		var parser = xml2js.Parser({
				explicitArray: false,
				normalizeTags: true
			});

		BPromise.promisifyAll(parser);

		return parser.parseStringAsync(body).then(function(result) {
				var root = result['imsx_poxenveloperequest'];
				var poxBody = root['imsx_poxbody'];
				var typeSuffix = 'resultrequest';

				var requestType = _.find(_.values(self.requestTypes),
					function(type) {
						return poxBody[type + typeSuffix];
					});

				if (!requestType) {
					return null;
				}

				var resultRecord = poxBody[requestType + typeSuffix].resultrecord;

				var messageId = root['imsx_poxheader']['imsx_poxrequestheaderinfo']['imsx_messageidentifier'];
				var sourcedId = resultRecord.sourcedguid.sourcedid;
				var score =
					requestType === self.requestTypes.replace ?
					resultRecord.result.resultscore.textstring :
					null;

				return {
					type: requestType,
					messageId: messageId,
					sourcedId: sourcedId,
					score: score
				}
			});
	},
	parseSourcedId: function(sourcedId) {
		var splitSourcedId = sourcedId.split(':::');

		return {
			signature: splitSourcedId[0],
			contentId: splitSourcedId[1],
			userId: splitSourcedId[2]
		};
	},
	sourcedIdBaseString: function(contentId, userId, secret) {
		return secret + ':::' + contentId + ':::' + userId;
	},
	sourcedIdSignature: function(contentId, userId, secret) {
		return crypto.
			createHash('sha1').
			update(this.sourcedIdBaseString(contentId, userId, secret)).
			digest('base64');
	},
	signedSourcedId: function(contentId, userId, secret) {
		var x = this.sourcedIdSignature(contentId, userId, secret) + ":::" +
			contentId + ":::" +
			userId;

			console.dir(x);

		return x;
	},
	validSourcedId: function(parsedSourcedId, secret) {
		var baseString = this.sourcedIdBaseString(parsedSourcedId.contentId, parsedSourcedId.userId, secret);
		var computedSignature = this.sourcedIdSignature(parsedSourcedId.contentId, parsedSourcedId.userId, secret);

		return computedSignature === parsedSourcedId.signature;
	},
	response: function(type, messageRefId, description, body, codeMajor, severity) {
		var response = {
			'imsx_POXEnvelopeRequest': {
				'$': {'xmlns': 'http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0'},
				'imsx_POXHeader': {
					'imsx_POXResponseHeaderInfo': {
						'imsx_version': 'V1.0',
						'imsx_messageIdentifier': uuid.v4(),
						'imsx_statusInfo': {
							'imsx_codeMajor': codeMajor || 'success',
							'imsx_severity': severity || 'status',
							'imsx_description': description,
							'imsx_messageRefIdentifier': messageRefId,
							'imsx_operationRefIdentifier': type + 'Result'
						}
					}
				}
			}
		};

		if (body) {
			response['imsx_POXEnvelopeRequest']['imsx_POXBody'] = body;
		}

		var builder = new xml2js.Builder({
			'pretty': true,
			'xmldec': {'version': '1.0', 'encoding': 'UTF-8'}
		});

		return builder.buildObject(response);
	},
	responseError: function(type, messageRefId, description, codeMajor, severity) {
		return this.response(
			type,
			messageRefId,
			description,
			null,
			codeMajor,
			severity
		);
	},
	responseReplace: function(messageRefId, sourcedId, score) {
		return this.response(
			this.requestTypes.replace,
			messageRefId,
			'Score for ' + sourcedId + ' is now ' + score,
			{
				'replaceResultResponse': null
			}
		);
	},
	responseRead: function(messageRefId, score) {
		return this.response(
			this.requestTypes.read,
			messageRefId,
			'Result read',
			{
				'readResultResponse': {
					'result': {
						'resultScore': {
							'language': 'en',
							'textString': score
						}
					}
				}
			}
		);
	},
	responseDelete: function(messageRefId) {
		return this.response(
			this.requestTypes.delete,
			messageRefId,
			'Result deleted',
			{
				'deleteResultResponse': null
			}
		);
	}
};
