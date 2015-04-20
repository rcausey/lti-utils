var uuid = require('node-uuid'),
	xml2js = require('xml2js'),
	requestTypes = require('./outcomes_constants').requestTypes;

module.exports = {
	create: function(type, messageRefId, description, body, messageId, codeMajor, severity) {

		var response = {
			imsx_POXEnvelopeResponse: {
				$: {xmlns: 'http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0'},
				imsx_POXHeader: {
					imsx_POXResponseHeaderInfo: {
						imsx_version: 'V1.0',
						imsx_messageIdentifier: messageId || uuid.v4(),
						imsx_statusInfo: {
							imsx_codeMajor: codeMajor || 'success',
							imsx_severity: severity || 'status',
							imsx_description: description,
							imsx_messageRefIdentifier: messageRefId,
							imsx_operationRefIdentifier: type + 'Result'
						}
					}
				}
			}
		};

		if (body) {
			response.imsx_POXEnvelopeResponse.imsx_POXBody = body;
		}

		var builder = new xml2js.Builder({
			pretty: true,
			xmldec: {version: '1.0', encoding: 'UTF-8'}
		});

		return builder.buildObject(response);
	},
	error: function(type, messageRefId, description, codeMajor, severity, messageId) {
		return this.create(
			type,
			messageRefId,
			description,
			null,
			messageId,
			codeMajor,
			severity
		);
	},
	replace: function(messageRefId, sourcedId, score, messageId) {
		return this.create(
			requestTypes.replace,
			messageRefId,
			'Score for ' + sourcedId + ' is now ' + score,
			{
				replaceResultResponse: null
			},
			messageId
		);
	},
	read: function(messageRefId, score, messageId) {
		return this.create(
			requestTypes.read,
			messageRefId,
			'Result read',
			{
				readResultResponse: {
					result: {
						resultScore: {
							language: 'en',
							textString: score
						}
					}
				}
			},
			messageId
		);
	},
	delete: function(messageRefId, messageId) {
		return this.create(
			requestTypes.delete,
			messageRefId,
			'Result deleted',
			{
				deleteResultResponse: null
			},
			messageId
		);
	}
};
