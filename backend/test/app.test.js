const assert = require('node:assert/strict');
const http = require('node:http');
const { after, before, test } = require('node:test');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgresql://localhost/portfolio_test';

const app = require('../src/app');

let server;

before(() => {
  server = app.listen(0);
});

after(
  () =>
    new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    })
);

function request(path) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const req = http.get(
      {
        host: '127.0.0.1',
        port: address.port,
        path,
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ body, headers: res.headers, statusCode: res.statusCode });
        });
      }
    );

    req.on('error', reject);
  });
}

test('Express app starts and serves the health endpoint', async () => {
  const response = await request('/api/health');

  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).status, 'ok');
});

test('Express does not expose the X-Powered-By header', async () => {
  const response = await request('/api/health');

  assert.equal(response.headers['x-powered-by'], undefined);
});
