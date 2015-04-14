var requestTypes = require('./outcomes_constants').requestTypes,
	xml2js = require('xml2js'),
	BPromise = require('bluebird'),
	_ = require('lodash'),
	crypto = require('crypto');

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
			var root = result.imsx_poxenveloperequest;
			var poxBody = root.imsx_poxbody;
			var typeSuffix = 'resultrequest';

			var requestType = _.find(_.values(requestTypes),
				function(type) {
					return poxBody[type + typeSuffix];
				});

			if (!requestType) {
				return null;
			}

			var resultRecord = poxBody[requestType + typeSuffix].resultrecord;

			var messageId = root.imsx_poxheader.imsx_poxrequestheaderinfo.imsx_messageidentifier;
			var sourcedId = resultRecord.sourcedguid.sourcedid;
			var score =
				requestType === requestTypes.replace ?
				resultRecord.result.resultscore.textstring :
				null;

			return {
				type: requestType,
				messageId: messageId,
				sourcedId: sourcedId,
				score: score
			};
		});
	}
};
