var should = require('chai').should(),
	parseAuthHeader = require('../lib/lti').parseAuthHeader;

describe('parseAuthHeader', function() {
	it('should return null when not an OAuth header', function(done) {
		should.not.exist(parseAuthHeader("Basic ZnJlZDpmcmVk"));

		done();
	});

	it('should return null when there are missing required params', function(done) {
		should.not.exist(parseAuthHeader(
			'OAuth realm="", ' + 
			'oauth_version="1.0"'
		));

		done();
	});

	it('should correctly parse a valid OAuth header', function(done) {
		var parsedAuthHeader = parseAuthHeader(
			'OAuth realm="",' + 
			'oauth_version="1.0",' +
			'oauth_nonce="29f90c047a44b2ece73d00a09364d49b",' +
			'oauth_timestamp="1313350943",' + 
			'oauth_consumer_key="lmsng.school.edu",' +
			'oauth_body_hash="v+xFnmDSHV+j29qhxLwkFILrtPo=",' + 
			'oauth_signature_method="HMAC-SHA1",' + 
			'oauth_signature="8auRpRdPY2KRXUrOyz3HKCs92y8="'
		);

		parsedAuthHeader.should.include.keys(
			'oauth_version',
			'oauth_nonce',
			'oauth_timestamp',
			'oauth_consumer_key',
			'oauth_body_hash',
			'oauth_signature_method',
			'oauth_signature'
		);

		parsedAuthHeader.oauth_version.should.equal('1.0');
		parsedAuthHeader.oauth_nonce.should.equal('29f90c047a44b2ece73d00a09364d49b');
		parsedAuthHeader.oauth_timestamp.should.equal('1313350943');
		parsedAuthHeader.oauth_consumer_key.should.equal('lmsng.school.edu');
		parsedAuthHeader.oauth_body_hash.should.equal('v+xFnmDSHV+j29qhxLwkFILrtPo=');
		parsedAuthHeader.oauth_signature_method.should.equal('HMAC-SHA1');
		parsedAuthHeader.oauth_signature.should.equal('8auRpRdPY2KRXUrOyz3HKCs92y8=');
		
		done();
	});
});