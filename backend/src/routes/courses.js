const { readOnlyGuard } = require('../middleware/readOnly');
const { parseId } = require('../utils/id');
const { parsePagination } = require('../utils/pagination');
const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

/**
 * GET /api/courses
 * Optional query params:
 * - status=planned|in_progress|completed
 * - schoolId=number
 */
router.get('/', async (req, res, next) => {
  try {
    const pag = parsePagination(req.query);
    if (pag.error) return res.status(400).json({ error: pag.error });
    const { limit, offset } = pag;

    const where = [];
    const params = [];

    if (req.query.status) {
      params.push(req.query.status);
      where.push(`c.status = $${params.length}`);
    }

    if (req.query.schoolId !== undefined) {
      const schoolId = parseId(req.query.schoolId);
      if (schoolId === null) return res.status(400).json({ error: 'schoolId must be a number' });
      params.push(schoolId);
      where.push(`c.school_id = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS total FROM course c ${whereSql}`;
    const countResult = await pool.query(countSql, params);
    const total = countResult.rows[0]?.total ?? 0;

    const itemsParams = [...params, limit, offset];
    const limitParamIndex = itemsParams.length - 1;
    const offsetParamIndex = itemsParams.length;

    const itemsSql = `
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
      LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
    `;

    const itemsResult = await pool.query(itemsSql, itemsParams);

    res.json({ items: itemsResult.rows, total, limit, offset });
  } catch (e) {
    next(e);
  }
});

router.get('/:id/details', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    // 1) course
    const courseResult = await pool.query(
      `SELECT course_id, name, start_date, end_date, status, grade, school_id, diary_id
       FROM course
       WHERE course_id = $1`,
      [id]
    );

    if (courseResult.rowCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseResult.rows[0];

    // 2) related projects
    const projectsResult = await pool.query(
      `SELECT p.project_id, p.name, cp.relation_type, cp.note
       FROM course_projects cp
       JOIN project p ON p.project_id = cp.project_id
       WHERE cp.course_id = $1
       ORDER BY p.name ASC`,
      [id]
    );

    // 3) related tech
    const techResult = await pool.query(
      `SELECT t.tech_id, t.name, ct.note
       FROM course_tech ct
       JOIN tech t ON t.tech_id = ct.tech_id
       WHERE ct.course_id = $1
       ORDER BY t.name ASC`,
      [id]
    );

    res.json({
      ...course,
      projects: projectsResult.rows,
      tech: techResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/courses/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
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

    const schoolId = parseId(school_id);
    if (schoolId === null) return res.status(400).json({ error: 'school_id must be a number' });

    const diaryId = diary_id === null || diary_id === undefined ? null : parseId(diary_id);
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
    const id = parseId(req.params.id);
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
        const n = parseId(value);
        if (n === null) return res.status(400).json({ error: 'school_id must be a number' });
        value = n;
      }

      if (key === 'diary_id') {
        if (value === null) {
          value = null;
        } else {
          const n = parseId(value);
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
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid course id' });

    const r = await pool.query('DELETE FROM course WHERE course_id = $1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Course not found' });

    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
