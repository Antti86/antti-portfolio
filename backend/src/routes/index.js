// backend/src/routes/index.js
const router = require('express').Router();

const { health } = require('../controllers/healthController');
const projectsRoutes = require('./projects');
const coursesRoutes = require('./courses');

router.get('/health', health);
router.use('/projects', projectsRoutes);
router.use('/courses', coursesRoutes);

module.exports = router;
