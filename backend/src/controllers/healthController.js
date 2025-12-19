// backend/src/controllers/healthController.js
function health(req, res) {
  res.json({
    status: 'ok',
    service: 'portfolio-api',
    timestamp: new Date().toISOString(),
  });
}

module.exports = { health };
