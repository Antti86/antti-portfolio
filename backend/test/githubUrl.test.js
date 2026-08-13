const assert = require('node:assert/strict');
const { test } = require('node:test');

const { GITHUB_URL_ERROR, parseGitHubUrl } = require('../src/utils/githubUrl');

test('parseGitHubUrl accepts null and canonical GitHub repository URLs', () => {
  assert.deepEqual(parseGitHubUrl(null), { value: null });
  assert.deepEqual(parseGitHubUrl('https://github.com/Antti86/antti-portfolio'), {
    value: 'https://github.com/Antti86/antti-portfolio',
  });
  assert.deepEqual(parseGitHubUrl('https://github.com/open-ai/example_repo.js/'), {
    value: 'https://github.com/open-ai/example_repo.js',
  });
});

test('parseGitHubUrl rejects non-canonical or non-repository URLs', () => {
  const invalidValues = [
    undefined,
    '',
    ' https://github.com/Antti86/antti-portfolio',
    'http://github.com/Antti86/antti-portfolio',
    'https://gitlab.com/Antti86/antti-portfolio',
    'https://github.com.evil.example/Antti86/antti-portfolio',
    'https://github.com/Antti86',
    'https://github.com/Antti86/antti-portfolio/issues',
    'https://github.com/Antti86/antti-portfolio?tab=readme',
    'https://github.com/Antti86/antti-portfolio#readme',
    'https://github.com:443/Antti86/antti-portfolio',
    'https://github.com:8443/Antti86/antti-portfolio',
    'https://user@github.com/Antti86/antti-portfolio',
    'https://GITHUB.com/Antti86/antti-portfolio',
    'https://github.com/invalid--owner/repository',
    'https://github.com/Antti86/.',
    42,
    `https://github.com/Antti86/${'a'.repeat(101)}`,
  ];

  for (const value of invalidValues) {
    assert.deepEqual(parseGitHubUrl(value), { error: GITHUB_URL_ERROR }, String(value));
  }
});
