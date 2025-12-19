// backend/src/controllers/coursesController.js
const courses = require('../data/courses.json');

function listCourses(req, res) {
  res.json(courses);
}

module.exports = { listCourses };
