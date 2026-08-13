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

test('GET /api/projects returns github_url in project list items', async () => {
  queryResults = [
    { rowCount: 1, rows: [{ total: 1 }] },
    {
      rowCount: 1,
      rows: [
        {
          project_id: 7,
          name: 'Portfolio',
          github_url: 'https://github.com/Antti86/antti-portfolio',
        },
      ],
    },
  ];

  const response = await request('/api/projects');
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.equal(body.items[0].github_url, 'https://github.com/Antti86/antti-portfolio');
  assert.match(queryCalls[1].sql, /p\.github_url/);
});

test('GET /api/projects/:id returns github_url', async () => {
  queryResults = [
    {
      rowCount: 1,
      rows: [
        {
          project_id: 7,
          name: 'Portfolio',
          github_url: 'https://github.com/Antti86/antti-portfolio',
        },
      ],
    },
  ];

  const response = await request('/api/projects/7');
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.equal(body.github_url, 'https://github.com/Antti86/antti-portfolio');
  assert.match(queryCalls[0].sql, /p\.github_url/);
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
          github_url: 'https://github.com/Antti86/antti-portfolio',
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
  assert.equal(body.github_url, 'https://github.com/Antti86/antti-portfolio');
  assert.equal('demo_url' in body, false);
  assert.equal('created_at' in body, false);
  assert.equal(queryCalls.length, 3);
  assert.match(queryCalls[0].sql, /p\.github_url/);
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

function methodRequest(path, method) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const req = http.request(
      { host: '127.0.0.1', method, path, port: address.port },
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
    req.end();
  });
}

function jsonRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const payload = JSON.stringify(body);
    const req = http.request(
      {
        headers: {
          'content-length': Buffer.byteLength(payload),
          'content-type': 'application/json',
        },
        host: '127.0.0.1',
        method,
        path,
        port: address.port,
      },
      (res) => {
        let responseBody = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          resolve({ body: responseBody, headers: res.headers, statusCode: res.statusCode });
        });
      }
    );

    req.on('error', reject);
    req.end(payload);
  });
}

function newProject(overrides = {}) {
  return {
    name: 'Portfolio',
    status: 'planned',
    ...overrides,
  };
}

test('POST /api/projects stores null when github_url is omitted', async () => {
  queryResults = [{ rowCount: 1, rows: [newProject({ github_url: null, project_id: 7 })] }];

  const response = await jsonRequest('/api/projects', 'POST', newProject());

  assert.equal(response.statusCode, 201);
  assert.deepEqual(queryCalls[0].params, ['Portfolio', null, null, null, 'planned', null, null, null]);
  assert.match(queryCalls[0].sql, /github_url/);
});

test('POST /api/projects accepts null github_url', async () => {
  queryResults = [{ rowCount: 1, rows: [newProject({ github_url: null, project_id: 7 })] }];

  const response = await jsonRequest('/api/projects', 'POST', newProject({ github_url: null }));

  assert.equal(response.statusCode, 201);
  assert.equal(queryCalls[0].params[6], null);
});

test('POST /api/projects normalizes a valid github_url', async () => {
  const githubUrl = 'https://github.com/Antti86/antti-portfolio';
  queryResults = [{ rowCount: 1, rows: [newProject({ github_url: githubUrl, project_id: 7 })] }];

  const response = await jsonRequest(
    '/api/projects',
    'POST',
    newProject({ github_url: `${githubUrl}/` })
  );

  assert.equal(response.statusCode, 201);
  assert.equal(queryCalls[0].params[6], githubUrl);
});

test('POST /api/projects rejects an invalid github_url without querying the database', async () => {
  const response = await jsonRequest(
    '/api/projects',
    'POST',
    newProject({ github_url: 'https://github.com/Antti86/antti-portfolio/issues' })
  );

  assert.equal(response.statusCode, 400);
  assert.deepEqual(JSON.parse(response.body), {
    error: 'github_url must be null or a canonical GitHub repository URL',
  });
  assert.equal(queryCalls.length, 0);
});

test('PUT /api/projects/:id normalizes a valid github_url', async () => {
  const githubUrl = 'https://github.com/Antti86/antti-portfolio';
  queryResults = [{ rowCount: 1, rows: [{ github_url: githubUrl, project_id: 7 }] }];

  const response = await jsonRequest('/api/projects/7', 'PUT', { github_url: `${githubUrl}/` });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(queryCalls[0].params, [githubUrl, 7]);
  assert.match(queryCalls[0].sql, /SET github_url = \$1/);
});

test('PUT /api/projects/:id accepts null github_url', async () => {
  queryResults = [{ rowCount: 1, rows: [{ github_url: null, project_id: 7 }] }];

  const response = await jsonRequest('/api/projects/7', 'PUT', { github_url: null });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(queryCalls[0].params, [null, 7]);
  assert.match(queryCalls[0].sql, /SET github_url = \$1/);
});

test('PUT /api/projects/:id does not change github_url when it is omitted', async () => {
  queryResults = [{ rowCount: 1, rows: [{ name: 'Renamed', project_id: 7 }] }];

  const response = await jsonRequest('/api/projects/7', 'PUT', { name: 'Renamed' });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(queryCalls[0].params, ['Renamed', 7]);
  assert.match(queryCalls[0].sql, /SET name = \$1/);
  assert.doesNotMatch(queryCalls[0].sql, /SET github_url/);
});

test('PUT /api/projects/:id rejects an invalid github_url without querying the database', async () => {
  const response = await jsonRequest('/api/projects/7', 'PUT', {
    github_url: 'https://example.com/Antti86/antti-portfolio',
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(JSON.parse(response.body), {
    error: 'github_url must be null or a canonical GitHub repository URL',
  });
  assert.equal(queryCalls.length, 0);
});

test('key entity routes reject malformed IDs without querying the database', async () => {
  const cases = [
    ['/api/projects/7abc/details', 'Invalid project id'],
    ['/api/courses/1.5/details', 'Invalid course id'],
    ['/api/tech/0/details', 'Invalid tech id'],
    ['/api/schools/-1', 'Invalid school id'],
    ['/api/diaries/7abc', 'Invalid diary id'],
    ['/api/projects?schoolId=', 'schoolId must be a number'],
    ['/api/courses?schoolId=7abc', 'schoolId must be a number'],
  ];

  for (const [path, error] of cases) {
    const response = await request(path);

    assert.equal(response.statusCode, 400, path);
    assert.deepEqual(JSON.parse(response.body), { error }, path);
    assert.equal(queryCalls.length, 0, path);
  }
});

test('relationship routes reject malformed IDs without querying the database', async () => {
  const cases = [
    ['/api/projects/0/tech', 'GET', 'Invalid project id'],
    ['/api/projects/1/tech/7abc', 'DELETE', 'Invalid tech id'],
    ['/api/projects/1/courses/1.5', 'DELETE', 'Invalid course id'],
  ];

  for (const [path, method, error] of cases) {
    const response = await methodRequest(path, method);

    assert.equal(response.statusCode, 400, path);
    assert.deepEqual(JSON.parse(response.body), { error }, path);
    assert.equal(queryCalls.length, 0, path);
  }
});
