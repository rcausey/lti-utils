var crypto = require('crypto');

module.exports = {
	parse: function(sourcedIdString, secret) {
		var signedObject = JSON.parse(
			new Buffer(sourcedIdString, 'base64').toString('utf8')
		);
		if (signedObject.signature !== 
			this.sign(signedObject.data, secret)) {
			return null;
		}
		return signedObject.data;
	},

	sign: function(obj, secret) {
		return crypto
			.createHash('sha1', secret)
			.update(JSON.stringify(obj))
			.digest('base64');
	},

	createString: function(obj, secret) {
		return new Buffer(JSON.stringify( {
			data: obj,
			signature: this.sign(obj, secret)
		})).toString('base64');
	}
};
