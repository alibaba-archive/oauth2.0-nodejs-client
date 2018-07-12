'use strict';

const querystring = require('querystring');

const httpx = require('httpx');

class Client {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessTokenUri = config.accessTokenUri || 'https://oauth.aliyun.com/v1/token';
    this.authorizationUri = config.authorizationUri || 'https://signin.aliyun.com/oauth2/v1/auth',
    this.revokeTokenUri = config.revokeTokenUri || 'https://oauth.aliyun.com/v1/revoke';
  }

  getAuthorizeURL(redirectUri, state, scope, accessType = 'online') {
    const queries = {
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      access_type: accessType,
      state: state
    };

    return `${this.authorizationUri}?${querystring.stringify(queries)}`;
  }

  async _request(url) {
    const response = await httpx.request(url);
    const body = await httpx.read(response, 'utf8');
    const contentType = response.headers['content-type'] || '';
    if (!contentType.startsWith('application/json')) {
      throw new Error(`content type invalid: ${contentType}, should be 'application/json'`);
    }

    const data = JSON.parse(body);

    if (data.error) {
      var err = new Error(`${data.error}: ${data.error_description}`);
      err.name = 'OAuthServerError';
      err.code = data.error;
      err.data = {
        httpcode: data.http_code,
        requestid: data.request_id
      };
      throw err;
    }

    return data;
  }

  /**
   * 根据授权获取到的code，换取access token和openid
   * 获取openid之后，可以调用`wechat.API`来获取更多信息
   * Examples:
   * ```
   * await api.getAccessToken(code);
   * ```
   * Exception:
   *
   * - `err`, 获取access token出现异常时的异常对象
   *   - `message`
   *   - `code`
   *   - `data`
   *     - `requestid`
   *
   * 返回值:
   * ```
   * {
   *   "access_token": "eyJraWQiOiJrMTIzNCIsImVuY...",
   *   "token_type": "Bearer",
   *   "expires_in": 3600,
   *   "refresh_token": "Ccx63VVeTn2dxV7ovXXfLtAqLLERAH1Bc",
   *   "id_token": "eyJhbGciOiJIUzI1N..."
   * }
   * ```
   * @param {String} code 授权获取到的code
   */
  getAccessToken(code, redirectUri = '') {
    const info = {
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirectUri: redirectUri,
      grant_type: 'authorization_code'
    }

    const url = `${this.accessTokenUri}?${querystring.stringify(info)}`;
    return this._request(url);
  }

  refreshAccessToken(refreshToken) {
    const info = {
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
    };

    const url = `${this.accessTokenUri}?${querystring.stringify(info)}`;

    return this._request(url);
  }

  revokeAccessToken(accessToken) {
    const info = {
      token: accessToken,
      client_id: this.clientId,
      client_secret: this.clientSecret
    };

    const url = `${this.revokeTokenUri}?${querystring.stringify(info)}`;
    return this._request(url);
  }
}

module.exports = Client;
