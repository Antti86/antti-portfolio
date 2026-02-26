const { readOnlyGuard } = require('../middleware/readOnly');
const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// READ all
router.get('/', async (_req, res, next) => {
  try {
    const r = await pool.query('SELECT tech_id, name FROM tech ORDER BY name');
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

// READ one
router.get('/:id', async (req, res, next) => {
  try {
    const r = await pool.query('SELECT tech_id, name FROM tech WHERE tech_id = $1', [
      req.params.id,
    ]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

// CREATE
router.post('/', readOnlyGuard, async (req, res, next) => {
  try {
    const { name } = req.body;
    const r = await pool.query('INSERT INTO tech (name) VALUES ($1) RETURNING tech_id, name', [
      name,
    ]);
    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

// UPDATE
router.put('/:id', readOnlyGuard, async (req, res, next) => {
  try {
    const { name } = req.body;
    const r = await pool.query(
      'UPDATE tech SET name = $1 WHERE tech_id = $2 RETURNING tech_id, name',
      [name, req.params.id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

// DELETE
router.delete('/:id', readOnlyGuard, async (req, res, next) => {
  try {
    const r = await pool.query('DELETE FROM tech WHERE tech_id = $1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
