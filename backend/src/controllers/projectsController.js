// backend/src/controllers/projectsController.js
const projects = require('../data/projects.json');

function listProjects(req, res) {
  const { featured } = req.query;

  let result = projects;

  if (featured === 'true') {
    result = projects.filter((p) => p.featured === true);
  }

  res.json(result);
}

function getProjectById(req, res, next) {
  const { id } = req.params;

  const project = projects.find((p) => p.id === id);
  if (!project) {
    const err = new Error(`Project not found: ${id}`);
    err.status = 404;
    return next(err);
  }

  res.json(project);
}

module.exports = { listProjects, getProjectById };
