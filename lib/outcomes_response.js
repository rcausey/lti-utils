var uuid = require('node-uuid'),
	xml2js = require('xml2js'),
	requestTypes = require('./outcomes_constants').requestTypes;

module.exports = {
	create: function(type, messageRefId, description, body, codeMajor, severity) {
		var response = {
			imsx_POXEnvelopeRequest: {
				$: {xmlns: 'http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0'},
				imsx_POXHeader: {
					imsx_POXResponseHeaderInfo: {
						imsx_version: 'V1.0',
						imsx_messageIdentifier: uuid.v4(),
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
			response.imsx_POXEnvelopeRequest.imsx_POXBody = body;
		}

		var builder = new xml2js.Builder({
			pretty: true,
			xmldec: {version: '1.0', encoding: 'UTF-8'}
		});

		return builder.buildObject(response);
	},
	error: function(type, messageRefId, description, codeMajor, severity) {
		return this.create(
			type,
			messageRefId,
			description,
			null,
			codeMajor,
			severity
		);
	},
	replace: function(messageRefId, sourcedId, score) {
		return this.create(
			requestTypes.replace,
			messageRefId,
			'Score for ' + sourcedId + ' is now ' + score,
			{
				replaceResultResponse: null
			}
		);
	},
	read: function(messageRefId, score) {
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
			}
		);
	},
	delete: function(messageRefId) {
		return this.create(
			requestTypes.delete,
			messageRefId,
			'Result deleted',
			{
				deleteResultResponse: null
			}
		);
	}
};
