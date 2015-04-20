var should = require('chai').should(),
	assert = require('chai').assert,
	outcomesBody = require('../lib/lti').outcomesBody,
	readSampleXml = require('./test-util').readSampleXml,
	BPromise = require('bluebird'),
	requestTypes = require('../lib/outcomes_constants').requestTypes;

var validHash = outcomesBody.validHash,
	parse = outcomesBody.parse;

var replaceFile = 'outcomes_request_replace.xml',
	readFile = 'outcomes_request_read.xml';

describe('outcomesBody', function() {
	describe('validHash', function() {
		it('should return false for invalid body hash', function(done) {
			readSampleXml(replaceFile).then(function(content) {
				validHash(content, 'invalid_hash').should.be.false;
				done();
			});
		});

		it('should return true for valid body hash', function(done) {
			readSampleXml(replaceFile).then(function(content) {
				validHash(content, 'ln3tIsK/E6zLkeRrgs6QhFLgXt4=').should.be.true;
				done();
			});
		});
	});

	describe('parse', function() {
		it('should correctly parse valid replace body', function(done) {
			readSampleXml(replaceFile).then(parse).then(function(result) {
				result.should.include.keys(
					'type',
					'messageId',
					'sourcedId',
					'score'	
				);

				result.type.should.equal(requestTypes.replace);
				result.messageId.should.equal('999999123');
				result.sourcedId.should.equal('3124567');
				result.score.should.equal('0.92');

				done();
			});
		});

		it('should correctly parse valid read body', function(done) {
			readSampleXml(replaceFile).then(parse).then(function(result) {
				result.should.include.keys(
					'type',
					'messageId',
					'sourcedId',
					'score'	
				);

				result.type.should.equal(requestTypes.replace);
				result.messageId.should.equal('999999123');
				result.sourcedId.should.equal('3124567');

				done();
			});
		});

		it('should throw an error with an invalid xml body', function(done) {
			parse('<xml>blah').then(assert.fail).catch(function(e) {
				done();
			});
		});
	});
});