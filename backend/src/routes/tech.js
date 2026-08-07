const { readOnlyGuard } = require('../middleware/readOnly');
const { parseId } = require('../utils/id');
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

router.get('/:id/details', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Invalid tech id' });
    }

    // 1) tech
    const techResult = await pool.query(
      `SELECT tech_id, name
       FROM tech
       WHERE tech_id = $1`,
      [id]
    );

    if (techResult.rowCount === 0) {
      return res.status(404).json({ error: 'Tech not found' });
    }

    const tech = techResult.rows[0];

    // 2) related projects
    const projectsResult = await pool.query(
      `SELECT p.project_id, p.name, pt.note
       FROM project_tech pt
       JOIN project p ON p.project_id = pt.project_id
       WHERE pt.tech_id = $1
       ORDER BY p.name ASC`,
      [id]
    );

    // 3) related courses
    const coursesResult = await pool.query(
      `SELECT c.course_id, c.name, ct.note
       FROM course_tech ct
       JOIN course c ON c.course_id = ct.course_id
       WHERE ct.tech_id = $1
       ORDER BY c.name ASC`,
      [id]
    );

    res.json({
      ...tech,
      projects: projectsResult.rows,
      courses: coursesResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// READ one
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid tech id' });

    const r = await pool.query('SELECT tech_id, name FROM tech WHERE tech_id = $1', [id]);
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
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid tech id' });

    const { name } = req.body;
    const r = await pool.query(
      'UPDATE tech SET name = $1 WHERE tech_id = $2 RETURNING tech_id, name',
      [name, id]
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
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid tech id' });

    const r = await pool.query('DELETE FROM tech WHERE tech_id = $1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
