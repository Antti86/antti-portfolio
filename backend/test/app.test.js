const assert = require('node:assert/strict');
const http = require('node:http');
const { after, before, beforeEach, test } = require('node:test');

process.env.NODE_ENV = 'test';
const queryCalls = [];
let queryResults = [];
const pool = {
  query(sql, params) {
    queryCalls.push({ params, sql });
    const result = queryResults.shift();
    if (result instanceof Error) return Promise.reject(result);
    return Promise.resolve(result);
  },
};

const poolPath = require.resolve('../src/db/pool');
require.cache[poolPath] = {
  id: poolPath,
  filename: poolPath,
  loaded: true,
  exports: pool,
};

const app = require('../src/app');

let server;

before(() => {
  server = app.listen(0);
});

beforeEach(() => {
  queryCalls.length = 0;
  queryResults = [];
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

test('GET /api/projects/:id/details returns project details at the top level', async () => {
  queryResults = [
    {
      rowCount: 1,
      rows: [
        {
          project_id: 7,
          name: 'Portfolio',
          start_date: '2026-02-20',
          end_date: null,
          status: 'in_progress',
          description: 'Full-stack portfolio',
          school_id: 1,
          school_name: 'School',
          diary_id: 2,
          diary_slug: 'portfolio',
          diary_title: 'Portfolio diary',
        },
      ],
    },
    {
      rowCount: 1,
      rows: [{ tech_id: 3, name: 'Node.js', usage_area: 'API', note: 'Backend runtime' }],
    },
    {
      rowCount: 1,
      rows: [
        {
          course_id: 4,
          name: 'Web Development',
          start_date: '2026-01-01',
          end_date: null,
          status: 'in_progress',
          grade: null,
          relation_type: 'course_project',
          note: 'Main assignment',
        },
      ],
    },
  ];

  const response = await request('/api/projects/7/details');
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.equal(body.project_id, 7);
  assert.equal(body.name, 'Portfolio');
  assert.ok(Array.isArray(body.tech));
  assert.ok(Array.isArray(body.courses));
  assert.equal(body.tech[0].usage_area, 'API');
  assert.equal(body.courses[0].relation_type, 'course_project');
  assert.equal(body.courses[0].note, 'Main assignment');
  assert.equal('project' in body, false);
  assert.equal('github_url' in body, false);
  assert.equal('demo_url' in body, false);
  assert.equal('created_at' in body, false);
  assert.equal(queryCalls.length, 3);
  for (const call of queryCalls) {
    assert.deepEqual(call.params, [7]);
    assert.match(call.sql, /\$1/);
  }
});

test('GET /api/projects/:id/details returns empty relationship arrays', async () => {
  queryResults = [
    { rowCount: 1, rows: [{ project_id: 8, name: 'Standalone project' }] },
    { rowCount: 0, rows: [] },
    { rowCount: 0, rows: [] },
  ];

  const response = await request('/api/projects/8/details');
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(body.tech, []);
  assert.deepEqual(body.courses, []);
});

test('GET /api/projects/:id/details rejects an invalid ID without querying the database', async () => {
  const response = await request('/api/projects/not-a-number/details');

  assert.equal(response.statusCode, 400);
  assert.deepEqual(JSON.parse(response.body), { error: 'Invalid project id' });
  assert.equal(queryCalls.length, 0);
});

test('GET /api/projects/:id/details returns 404 without querying relationships', async () => {
  queryResults = [{ rowCount: 0, rows: [] }];

  const response = await request('/api/projects/404/details');

  assert.equal(response.statusCode, 404);
  assert.deepEqual(JSON.parse(response.body), { error: 'Project not found' });
  assert.equal(queryCalls.length, 1);
});

test('GET /api/projects/:id/details passes database failures to the error middleware', async () => {
  queryResults = [new Error('Database unavailable')];

  const response = await request('/api/projects/9/details');
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 500);
  assert.equal(body.error, 'Database unavailable');
  assert.equal(queryCalls.length, 1);
});
