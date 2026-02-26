const { readOnlyGuard } = require('../middleware/readOnly');
const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

/**
 * Helpers
 */
function toInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * GET /api/courses
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
      where.push(`c.status = $${params.length}`);
    }

    if (req.query.schoolId) {
      const schoolId = toInt(req.query.schoolId);
      if (schoolId === null) return res.status(400).json({ error: 'schoolId must be a number' });
      params.push(schoolId);
      where.push(`c.school_id = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT
        c.course_id,
        c.name,
        c.start_date,
        c.end_date,
        c.status,
        c.grade,
        c.school_id,
        s.name AS school_name,
        c.diary_id,
        d.slug AS diary_slug,
        d.title AS diary_title
      FROM course c
      JOIN school s ON s.school_id = c.school_id
      LEFT JOIN diary d ON d.diary_id = c.diary_id
      ${whereSql}
      ORDER BY c.start_date DESC, c.course_id DESC
    `;

    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/courses/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid course id' });

    const sql = `
      SELECT
        c.course_id,
        c.name,
        c.start_date,
        c.end_date,
        c.status,
        c.grade,
        c.school_id,
        s.name AS school_name,
        c.diary_id,
        d.slug AS diary_slug,
        d.title AS diary_title
      FROM course c
      JOIN school s ON s.school_id = c.school_id
      LEFT JOIN diary d ON d.diary_id = c.diary_id
      WHERE c.course_id = $1
    `;

    const r = await pool.query(sql, [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/courses
 * Body:
 * {
 *   "name": "SQL ja relaatiotietokannat",
 *   "start_date": "2026-02-01",
 *   "end_date": "2026-02-20",          // optional
 *   "status": "completed",
 *   "grade": null,                     // optional
 *   "school_id": 1,
 *   "diary_id": 2                      // optional
 * }
 */
router.post('/', readOnlyGuard, async (req, res, next) => {
  try {
    const {
      name,
      start_date,
      end_date = null,
      status,
      grade = null,
      school_id,
      diary_id = null,
    } = req.body || {};

    if (!name || typeof name !== 'string')
      return res.status(400).json({ error: 'name is required' });
    if (!start_date || typeof start_date !== 'string')
      return res.status(400).json({ error: 'start_date is required (YYYY-MM-DD)' });
    if (!status || typeof status !== 'string')
      return res.status(400).json({ error: 'status is required' });

    const schoolId = toInt(school_id);
    if (schoolId === null) return res.status(400).json({ error: 'school_id must be a number' });

    const diaryId = diary_id === null || diary_id === undefined ? null : toInt(diary_id);
    if (diary_id !== null && diary_id !== undefined && diaryId === null) {
      return res.status(400).json({ error: 'diary_id must be a number or null' });
    }

    const sql = `
      INSERT INTO course (name, start_date, end_date, school_id, status, grade, diary_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING course_id, name, start_date, end_date, school_id, status, grade, diary_id
    `;

    const r = await pool.query(sql, [
      name.trim(),
      start_date,
      end_date,
      schoolId,
      status,
      grade,
      diaryId,
    ]);

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

/**
 * PUT /api/courses/:id
 * Body can include any of:
 * { name, start_date, end_date, status, grade, school_id, diary_id }
 */
router.put('/:id', readOnlyGuard, async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid course id' });

    const allowed = ['name', 'start_date', 'end_date', 'status', 'grade', 'school_id', 'diary_id'];
    const body = req.body || {};
    const keys = Object.keys(body).filter((k) => allowed.includes(k));

    if (keys.length === 0) {
      return res.status(400).json({ error: `Provide at least one of: ${allowed.join(', ')}` });
    }

    // Build dynamic update
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
        const n = toInt(value);
        if (n === null) return res.status(400).json({ error: 'school_id must be a number' });
        value = n;
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
      UPDATE course
      SET ${sets.join(', ')}
      WHERE course_id = $${params.length}
      RETURNING course_id, name, start_date, end_date, school_id, status, grade, diary_id
    `;

    const r = await pool.query(sql, params);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Course not found' });

    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/courses/:id
 * Note: link tables use ON DELETE CASCADE, so related rows in course_tech/course_projects are removed automatically.
 */
router.delete('/:id', readOnlyGuard, async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid course id' });

    const r = await pool.query('DELETE FROM course WHERE course_id = $1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Course not found' });

    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
