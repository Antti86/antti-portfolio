// backend/src/routes/projects.js
const router = require('express').Router();
const { listProjects, getProjectById } = require('../controllers/projectsController');

router.get('/', listProjects);
router.get('/:id', getProjectById);

module.exports = router;
