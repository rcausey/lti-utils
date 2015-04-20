var should = require('chai').should(),
	nonce = require('../lib/lti').nonce,
	testNonce = require('./test_util').testNonce;

describe('nonce', function() {
	it('should return random 32-digit hexadecimal string', function(done) {
		nonce().should.not.equal(nonce());
		testNonce(nonce()).should.be.true;

		done();
	});
});