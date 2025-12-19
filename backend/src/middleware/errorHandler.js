// backend/src/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  // Älä vuoda stackia tuotannossa
  const payload = {
    error: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}

module.exports = { errorHandler };
