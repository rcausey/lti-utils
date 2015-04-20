var should = require('chai').should(),
	_ = require('lodash'),
	toolConsumer = require('../lib/lti').toolConsumer,
	testUtil = require('./test-util'),
	oauthSign = require('oauth-sign');

describe('toolConsumer', function() {
	it('should perform valid launch', function(done) {
		var url = 'http://foo.bar';
		var parameters = { 'foo': 'bar' };
		var key = 'key';
		var secret = 'secret';
		var result = toolConsumer.launch(
			url,
			parameters,
			key,
			secret
		);
		
		result.should.include.keys(
			'foo',
			'oauth_callback',
			'oauth_consumer_key',
			'oauth_nonce',
			'oauth_signature_method',
			'oauth_timestamp',
			'oauth_version',
			'oauth_signature'
		);

		result.foo.should.equal(parameters.foo);
		result.oauth_callback.should.equal('about:blank');
		result.oauth_consumer_key.should.equal(key);
		result.oauth_signature_method.should.equal('HMAC-SHA1');
		result.oauth_version.should.equal('1.0');
		
		result.oauth_signature.should.equal(
			oauthSign.hmacsign(
				'POST', 
				url, 
				_.omit(result, ['oauth_signature']), 
				secret
			)
		);

		testUtil.testNonce(result.oauth_nonce).should.be.true;
		testUtil.testTimestamp(result.oauth_timestamp).should.be.true;

		done();
	});
});