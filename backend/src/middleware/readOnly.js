// backend/src/middleware/readOnly.js

function readOnlyGuard(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'API is read-only in production environment',
    });
  }

  next();
}

module.exports = {
  readOnlyGuard,
};
