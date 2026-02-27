const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

function toInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

router.get('/', async (_req, res, next) => {
  try {
    const r = await pool.query(
      `SELECT school_id, name, start_date, end_date, status, avg_grade
       FROM school
       ORDER BY name ASC`
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid school id' });

    const r = await pool.query(
      `SELECT school_id, name, start_date, end_date, status, avg_grade
       FROM school
       WHERE school_id = $1`,
      [id]
    );

    if (r.rowCount === 0) return res.status(404).json({ error: 'School not found' });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
