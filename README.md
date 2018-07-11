# Aliyun OAuth 2.0 Node.js Client

This SDK is used support login in Web Application, more details see https://help.aliyun.com/document_detail/69962.html .

## Installation

```sh
$ npm install @alicloud/oauth2
```

## Usage

1. Build the client with `client id` and `client secret`

```js
// Require it
const AliyunOAuth2 = require('@alicloud/oauth2');

const client = new AliyunOAuth2({
  clientId,
  clientSecret
});
```

The client can be used for All user to login with OAuth 2.0.

2. Get the authorize URL and let user redirect to the url

```js
const callback = 'https://yourwebapp.com/authcallback/';
const scope = 'openid /acs/ccc';
const state = '1234567890';
const url = auth.getAuthorizeURL(callback, state, scope, 'offline');
// like
// https://signin.aliyun.com/oauth2/v1/auth?client_id=123456&redirect_uri=https%3A%2F%2Fyourwebapp.com%2Fauthcallback%2F&response_type=code&scope=openid%20%2Facs%2Fccc&access_type=offline&state=1234567890
```

After user login with Aliyun Web UI, it will callback to your web app with code, like:

`https://yourwebapp.com/authcallback/?code=xxx`

3. Use code to get access token

```js
async function () {
  const reuslt = await client.getAccessToken('code');
});
```

If ok, the result like:

```json
{
  "access_token": "eyJraWQiOiJrMTIzNCIsImVuY...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "Ccx63VVeTn2dxV7ovXXfLtAqLLERAH1Bc",
  "id_token": "eyJhbGciOiJIUzI1N..."
}
```

If fails, throw an error like:

```js
var err = new Error(`${data.error}: ${data.error_description}`);
err.name = 'OAuthServerError';
err.code = data.error;
err.data = {
  httpcode: data.http_code,
  requestid: data.request_id
};
throw err;
```

4. When token expired, we can refresh it with `refresh token`

```js
async function () {
  const reuslt = await client.refreshAccessToken('refresh token');
});
```

The result is like getAccessToken return value.

5. Also, If need, we can revoke the token

```js
async function () {
  const reuslt = await client.revokeAccessToken('access token');
});
```

## License
The MIT license
