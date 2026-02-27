// backend/src/routes/index.js
const router = require('express').Router();

const { health } = require('../controllers/healthController');
const projectsRoutes = require('./projects');
const coursesRoutes = require('./courses');
const techRoutes = require('./tech');
const schoolRoutes = require('./schools');
const diaryRoutes = require('./diaries');
const healthRoutes = require('./health');

router.get('/health', health);
router.use('/projects', projectsRoutes);
router.use('/courses', coursesRoutes);
router.use('/tech', techRoutes);
router.use('/schools', schoolRoutes);
router.use('/diaries', diaryRoutes);
router.use('/health', healthRoutes);

module.exports = router;
