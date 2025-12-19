// backend/src/routes/courses.js
const router = require('express').Router();
const { listCourses } = require('../controllers/coursesController');

router.get('/', listCourses);

module.exports = router;
