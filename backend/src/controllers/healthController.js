const pool = require('../db/pool');

function health(_req, res) {
  res.json({
    status: 'ok',
    service: 'portfolio-api',
    timestamp: new Date().toISOString(),
  });
}

async function healthDb(_req, res, next) {
  try {
    const startedAt = Date.now();
    await pool.query('SELECT 1');
    const latencyMs = Date.now() - startedAt;

    res.json({
      status: 'ok',
      service: 'portfolio-api',
      db: 'ok',
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Let your global errorHandler format/log it
    next(err);
  }
}

module.exports = { health, healthDb };
