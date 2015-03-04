(function() {
  var Agent, Http, bilby, encode, http, oauth, q, qio, truthy,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Agent = require('keep-alive-agent');

  bilby = require('bilby');

  encode = require('./encode');

  oauth = require('./oauth');

  q = require('q');

  qio = require('q-io/http');

  truthy = require('truthy.js');

  http = Http = (function() {
    Http.parse = function(response) {
      return truthy.opt.lengthy(response);
    };

    Http.querystring = function(parameters) {
      return truthy.opt.lengthy(parameters).map(function(_) {
        return '?' + encode.url(_);
      }).getOrElse('');
    };

    function Http(baseUrl, consumerKey, consumerSecret) {
      this.baseUrl = baseUrl;
      this.consumerKey = consumerKey;
      this.consumerSecret = consumerSecret;
      this.withBody = __bind(this.withBody, this);
      this.agent = this.baseUrl.indexOf('https:') === 0 ? new Agent.Secure() : new Agent();
    }

    Http.prototype.post = function(payload, parameters) {
      return this.withBody('POST')(payload, parameters);
    };

    Http.prototype.withBody = function(verb) {
      return (function(_this) {
        return function(payload, parameters) {
          var deferred, oauthUrl, requestUrl;
          deferred = q.defer();
          oauthUrl = _this.baseUrl;
          requestUrl = oauthUrl + http.querystring(parameters);
          oauth.authorization(verb, oauthUrl, bilby.extend(payload, parameters), _this.consumerKey, _this.consumerSecret).cata({
            success: function(auth) {
              return deferred.resolve(bilby.extend(payload, auth));
            },
            failure: function(_) {
              return deferred.reject(_);
            }
          });
          return deferred.promise;
        };
      })(this);
    };

    return Http;

  })();

  module.exports = Object.freeze(http);

}).call(this);
