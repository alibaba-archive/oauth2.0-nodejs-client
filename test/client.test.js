'use strict';

const expect = require('expect.js');
const muk = require('muk');
const httpx = require('httpx');

const OAuth = require('../lib/client');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

describe('oauth.js', function () {

  describe('getAuthorizeURL', function () {
    var auth = new OAuth({
      clientId: '123456',
    });

    it('should ok', function () {
      const callback = 'https://yourwebapp.com/authcallback/';
      const scope = 'openid /acs/ccc';
      const state = '1234567890';
      var url = auth.getAuthorizeURL(callback, state, scope, 'offline');
      expect(url).to.be.equal('https://signin.aliyun.com/oauth2/v1/auth?client_id=123456&redirect_uri=https%3A%2F%2Fyourwebapp.com%2Fauthcallback%2F&response_type=code&scope=openid%20%2Facs%2Fccc&access_type=offline&state=1234567890');
    });
  });

  describe('getAccessToken', function () {
    var api = new OAuth({
      clientId,
      clientSecret
    });

    it('should invalid', async function () {
      try {
        await api.getAccessToken('code');
      } catch (err) {
        expect(err).to.be.ok();
        console.log(err.stack);
        expect(err.name).to.be.equal('OAuthServerError');
        expect(err.message).to.be.equal('invalid_grant: code is invalid');
        return;
      }
      // should never be executed
      expect(false).to.be.ok();
    });

    describe('should ok', function () {
      before(function () {
        muk(httpx, 'request', async function (url, opts) {
          return {
            headers: {
              'content-type': 'application/json'
            }
          };
        });

        muk(httpx, 'read', async function (response, encoding) {
          return JSON.stringify({
            "access_token": "eyJraWQiOiJrMTIzNCIsImVuY...",
            "token_type": "Bearer",
            "expires_in": 3600,
            "refresh_token": "Ccx63VVeTn2dxV7ovXXfLtAqLLERAH1Bc",
            "id_token": "eyJhbGciOiJIUzI1N..."
          });
        });
      });

      after(function () {
        muk.restore();
      });

      it('should ok', async function () {
        var result = await api.getAccessToken('code');
        expect(result).to.have.keys('access_token', 'token_type', 'expires_in', 'refresh_token', 'id_token');
      });
    });
  });

  describe('refreshAccessToken', function () {
    var api = new OAuth({
      clientId,
      clientSecret
    });

    it('should invalid', async function () {
      try {
        await api.refreshAccessToken('refresh_token');
      } catch (err) {
        console.log(err.stack);
        expect(err).to.be.ok();
        expect(err.name).to.be.equal('OAuthServerError');
        expect(err.message).to.be.equal('invalid_grant: invalid refreshToken');
        return;
      }

      // should never be executed
      expect(false).to.be.ok();
    });

    describe('should ok', function () {
      before(function () {
        muk(httpx, 'request', async function (url, opts) {
          return {
            headers: {
              'content-type': 'application/json'
            }
          };
        });

        muk(httpx, 'read', async function (response, encoding) {
          return JSON.stringify({
            "access_token": "eyJraWQiOiJrMTIzNCIsImVuY...",
            "token_type": "Bearer",
            "expires_in": 3600,
            "refresh_token": "Ccx63VVeTn2dxV7ovXXfLtAqLLERAH1Bc",
            "id_token": "eyJhbGciOiJIUzI1N..."
          });
        });
      });

      after(function () {
        muk.restore();
      });

      it('should ok', async function () {
        var result = await api.refreshAccessToken('refresh_token');
        expect(result).to.have.keys('access_token', 'token_type', 'expires_in', 'refresh_token', 'id_token');
      });
    });
  });

  describe('revokeAccessToken', function () {
    var api = new OAuth({
      clientId,
      clientSecret
    });

    it('should ok', async function () {
      const result = await api.revokeAccessToken('token');
      expect(result.success).to.be.ok();
      expect(result.message).to.be('success');
    });
  });
});
