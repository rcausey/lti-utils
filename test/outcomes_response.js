var lti = require('../lib/lti');
var outcomesConstants = lti.outcomesConstants;

var should = require('chai').should(),
	outcomesResponse = lti.outcomesResponse,
	readSampleXml = require('./test_util').readSampleXml,
	requestTypes = outcomesConstants.requestTypes,
	codeMajor = outcomesConstants.codeMajor,
	severity = outcomesConstants.severity;

var fs = require('fs');

describe('outcomesResponse', function() {
	it('should return valid replace response', function(done) {
		readSampleXml('outcomes_response_replace.xml').then(function(content) {
			var response = outcomesResponse.replace(
				'messageIdRef', 
				'sourcedId',
				'0.92',
				'messageId');

			should.equal(response, content);
			
			done();
		}, function(err) {
			done(err);
		});
	});

	it('should return valid error response', function(done) {
		readSampleXml('outcomes_response_error.xml').then(function(content) {
			var response = outcomesResponse.error(
				requestTypes.replace, 
				'messageIdRef', 
				'description', 
				codeMajor.failure, 
				severity.status,
				'messageId');

			should.equal(response, content);

			done();
		}, function(err) {
			done(err);
		});
	});
});