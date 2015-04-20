var should = require('chai').should(),
	outcomesSourcedId = require('../lib/lti').outcomesSourcedId;


describe('outcomesSourcedId', function() {
	it('should create and parse a valid object with a secret', function(done) {
		var secret = "secret";
		var sourcedId = {
			contentId: 'contentId',
			userId: 'userId'
		};

		var sourcedIdString = outcomesSourcedId.createString(sourcedId, secret);
		var parsedSourcedId = outcomesSourcedId.parse(sourcedIdString, secret);

		sourcedId.should.eql(parsedSourcedId);
		done();
	});
});