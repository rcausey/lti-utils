var should = require('chai').should(),
	_ = require('lodash'),
	nonce = require('../lib/lti').nonce;

describe('nonce', function() {
	it('should return random 32-digit hexadecimal string', function(done) {
		nonce().should.not.equal(nonce());
		/[0-9A-Za-z]{32}/.test(nonce()).should.be.true;

		done();
	});
});