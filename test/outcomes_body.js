var should = require('chai').should(),
	_ = require('lodash'),
	outcomesBody = require('../lib/lti').outcomesBody,
	fs = require('fs'),
	BPromise = require('bluebird');

BPromise.promisifyAll(fs);

var validHash = outcomesBody.validHash,
	parse = outcomesBody.parse;

function readSampleBody() {
	return fs.readFileAsync(
		__dirname + '/../test_files/outcomes_read_result_request_body.xml', 
		'utf-8'
	);
}

describe('outcomesBody', function() {
	describe('validHash', function() {
		it('should return false for invalid body hash', function(done) {
			readSampleBody().then(function(content) {
				validHash(content, 'invalid_hash').should.be.false;
				done();
			});
		});

		it('should return true for valid body hash', function(done) {
			readSampleBody().then(function(content) {
				validHash(content, 'ln3tIsK/E6zLkeRrgs6QhFLgXt4=').should.be.true;
				done();
			});
		});
	});

	describe('parse', function() {
		it('should correctly parse valid body', function(done) {
			readSampleBody().then(function(content) {
				parse(content).then(function(result) {
					result.should.include.keys(
						'type',
						'messageId',
						'sourcedId',
						'score'	
					);

					result.type.should.equal('replace');
					result.messageId.should.equal('999999123');
					result.sourcedId.should.equal('3124567');
					result.score.should.equal('0.92');

					done();
				});
			});
		});
	});
});