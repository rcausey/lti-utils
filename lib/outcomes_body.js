var requestTypes = require('./outcomes_constants').requestTypes,
	xml2js = require('xml2js'),
	BPromise = require('bluebird'),
	_ = require('lodash'),
	crypto = require('crypto');

function throwError() {
	throw new Error('Invalid request body');
}

module.exports = {
	validHash: function(body, bodyHash) {
		var computedBodyHash = crypto.
			createHash('sha1').
			update(body).
			digest('base64');
		return computedBodyHash === bodyHash;
	},

	parse: function(body) {
		var parser = xml2js.Parser({
				explicitArray: false,
				normalizeTags: true
			});

		BPromise.promisifyAll(parser);

		return parser.parseStringAsync(body).then(function(result) {
			var poxEnvelopeRequest = _.get(result, 
				'imsx_poxenveloperequest');
			var poxBody = _.get(poxEnvelopeRequest, 
				'imsx_poxbody');
			var messageId = _.get(poxEnvelopeRequest, 
				'imsx_poxheader.' +
				'imsx_poxrequestheaderinfo.' + 
				'imsx_messageidentifier');

			if (!messageId || 
				!poxBody || 
				!_.isObject(poxBody) || 
				_.keys(poxBody).length < 1) {
				throwError();
			}

			var requestType = _.first(_.keys(poxBody));
			var resultRecordPath = requestType + 
				'.resultrecord';
			var sourcedId = _.get(
				poxBody, 
				resultRecordPath + '.sourcedguid.sourcedid');
			var score = _.get(
				poxBody, 
				resultRecordPath + '.result.resultscore.textstring') || null;

			if (!sourcedId) {
				throwError();
			}

			var indexOfResultRequest = requestType.indexOf('resultrequest');
			var type = indexOfResultRequest == -1 ?
				requestType :
				requestType.substring(0, indexOfResultRequest);

			return {
				type: type,
				messageId: messageId,
				sourcedId: sourcedId,
				score: score
			};
		}, function(err) {
			throw new Error('Could not parse request body');
		});
	}
};
