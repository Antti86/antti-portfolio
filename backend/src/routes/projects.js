const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

function toInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * GET /api/projects
 * Optional query params:
 * - status=planned|in_progress|completed
 * - schoolId=number
 */
router.get('/', async (req, res, next) => {
  try {
    const where = [];
    const params = [];

    if (req.query.status) {
      params.push(req.query.status);
      where.push(`p.status = $${params.length}`);
    }

    if (req.query.schoolId) {
      const schoolId = toInt(req.query.schoolId);
      if (schoolId === null) return res.status(400).json({ error: 'schoolId must be a number' });
      params.push(schoolId);
      where.push(`p.school_id = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT
        p.project_id,
        p.name,
        p.start_date,
        p.end_date,
        p.status,
        p.description,
        p.school_id,
        s.name AS school_name,
        p.diary_id,
        d.slug AS diary_slug,
        d.title AS diary_title
      FROM project p
      LEFT JOIN school s ON s.school_id = p.school_id
      LEFT JOIN diary d ON d.diary_id = p.diary_id
      ${whereSql}
      ORDER BY
        -- prefer ongoing projects first
        (CASE WHEN p.end_date IS NULL THEN 0 ELSE 1 END),
        p.start_date DESC NULLS LAST,
        p.project_id DESC
    `;

    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/projects/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid project id' });

    const sql = `
      SELECT
        p.project_id,
        p.name,
        p.start_date,
        p.end_date,
        p.status,
        p.description,
        p.school_id,
        s.name AS school_name,
        p.diary_id,
        d.slug AS diary_slug,
        d.title AS diary_title
      FROM project p
      LEFT JOIN school s ON s.school_id = p.school_id
      LEFT JOIN diary d ON d.diary_id = p.diary_id
      WHERE p.project_id = $1
    `;

    const r = await pool.query(sql, [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/projects
 * Body:
 * {
 *   "name": "antti-portfolio",
 *   "start_date": "2026-02-20",        // optional
 *   "end_date": null,                  // optional
 *   "status": "in_progress",
 *   "description": "....",             // optional
 *   "school_id": 1,                    // optional
 *   "diary_id": 2                      // optional
 * }
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      start_date = null,
      end_date = null,
      status,
      description = null,
      school_id = null,
      diary_id = null,
    } = req.body || {};

    if (!name || typeof name !== 'string')
      return res.status(400).json({ error: 'name is required' });
    if (!status || typeof status !== 'string')
      return res.status(400).json({ error: 'status is required' });

    const schoolId = school_id === null || school_id === undefined ? null : toInt(school_id);
    if (school_id !== null && school_id !== undefined && schoolId === null) {
      return res.status(400).json({ error: 'school_id must be a number or null' });
    }

    const diaryId = diary_id === null || diary_id === undefined ? null : toInt(diary_id);
    if (diary_id !== null && diary_id !== undefined && diaryId === null) {
      return res.status(400).json({ error: 'diary_id must be a number or null' });
    }

    const sql = `
      INSERT INTO project (name, start_date, end_date, school_id, status, description, diary_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING project_id, name, start_date, end_date, school_id, status, description, diary_id
    `;

    const r = await pool.query(sql, [
      name.trim(),
      start_date,
      end_date,
      schoolId,
      status,
      description,
      diaryId,
    ]);

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

/**
 * PUT /api/projects/:id
 * Body can include any of:
 * { name, start_date, end_date, status, description, school_id, diary_id }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid project id' });

    const allowed = [
      'name',
      'start_date',
      'end_date',
      'status',
      'description',
      'school_id',
      'diary_id',
    ];
    const body = req.body || {};
    const keys = Object.keys(body).filter((k) => allowed.includes(k));

    if (keys.length === 0) {
      return res.status(400).json({ error: `Provide at least one of: ${allowed.join(', ')}` });
    }

    const sets = [];
    const params = [];

    for (const key of keys) {
      let value = body[key];

      if (key === 'name') {
        if (typeof value !== 'string' || !value.trim())
          return res.status(400).json({ error: 'name must be a non-empty string' });
        value = value.trim();
      }

      if (key === 'school_id') {
        if (value === null) {
          value = null;
        } else {
          const n = toInt(value);
          if (n === null)
            return res.status(400).json({ error: 'school_id must be a number or null' });
          value = n;
        }
      }

      if (key === 'diary_id') {
        if (value === null) {
          value = null;
        } else {
          const n = toInt(value);
          if (n === null)
            return res.status(400).json({ error: 'diary_id must be a number or null' });
          value = n;
        }
      }

      params.push(value);
      sets.push(`${key} = $${params.length}`);
    }

    params.push(id);

    const sql = `
      UPDATE project
      SET ${sets.join(', ')}
      WHERE project_id = $${params.length}
      RETURNING project_id, name, start_date, end_date, school_id, status, description, diary_id
    `;

    const r = await pool.query(sql, params);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Project not found' });

    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/projects/:id
 * Link tables use ON DELETE CASCADE, so related rows in project_tech/course_projects are removed automatically.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid project id' });

    const r = await pool.query('DELETE FROM project WHERE project_id = $1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Project not found' });

    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
