// backend/src/utils/pagination.js

function parsePagination(query, opts = {}) {
  const { defaultLimit = 20, maxLimit = 100, defaultOffset = 0 } = opts;

  const rawLimit = query.limit ?? String(defaultLimit);
  const rawOffset = query.offset ?? String(defaultOffset);

  const limit = Number.parseInt(rawLimit, 10);
  const offset = Number.parseInt(rawOffset, 10);

  if (!Number.isFinite(limit) || limit < 1) {
    return { error: 'limit must be a positive integer' };
  }
  if (!Number.isFinite(offset) || offset < 0) {
    return { error: 'offset must be 0 or greater' };
  }

  return {
    limit: Math.min(limit, maxLimit),
    offset,
  };
}

module.exports = {
  parsePagination,
};
