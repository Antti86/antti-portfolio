const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT tech_id, name FROM tech ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
