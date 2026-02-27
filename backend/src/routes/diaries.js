const { parsePagination } = require('../utils/pagination');
const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

function toInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

router.get('/', async (req, res, next) => {
  try {
    const pag = parsePagination(req.query);
    if (pag.error) return res.status(400).json({ error: pag.error });
    const { limit, offset } = pag;

    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM diary`);
    const total = countResult.rows[0]?.total ?? 0;

    const itemsResult = await pool.query(
      `SELECT diary_id, name, title, slug, created_at
       FROM diary
       ORDER BY created_at DESC, diary_id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ items: itemsResult.rows, total, limit, offset });
  } catch (e) {
    next(e);
  }
});

// handy for frontends: fetch by slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const slug = String(req.params.slug || '').trim();
    if (!slug) return res.status(400).json({ error: 'Invalid slug' });

    const r = await pool.query(
      `SELECT diary_id, name, title, slug, created_at
       FROM diary
       WHERE slug = $1`,
      [slug]
    );

    if (r.rowCount === 0) return res.status(404).json({ error: 'Diary not found' });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid diary id' });

    const r = await pool.query(
      `SELECT diary_id, name, title, slug, created_at
       FROM diary
       WHERE diary_id = $1`,
      [id]
    );

    if (r.rowCount === 0) return res.status(404).json({ error: 'Diary not found' });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
