var should = require('chai').should(),
	_ = require('lodash'),
	lti = require('../lib/lti');

describe('lti', function() {
	it('should export expected modules', function(done) {
		var modules = [
			'toolConsumer',
			'outcomesBody',
			'outcomesConstants',
			'outcomesResponse',
			'outcomesSourcedId',
			'nonce',
			'parseAuthHeader'
		];

		_.forEach(modules, function(module) {
			lti.hasOwnProperty(module).should.be.true;
		});
		
		done();
	});
});