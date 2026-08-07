const assert = require('node:assert/strict');
const { test } = require('node:test');

const { parseId } = require('../src/utils/id');

test('parseId accepts positive integer IDs', () => {
  for (const [value, expected] of [
    [1, 1],
    [7, 7],
    ['7', 7],
    ['007', 7],
  ]) {
    assert.equal(parseId(value), expected);
  }
});

test('parseId rejects invalid IDs', () => {
  for (const value of ['7abc', '1.5', 0, -1, '', '   ', null, undefined]) {
    assert.equal(parseId(value), null);
  }
});
