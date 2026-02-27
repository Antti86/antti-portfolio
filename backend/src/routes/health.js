const express = require('express');
const { health, healthDb } = require('../controllers/healthController');

const router = express.Router();

router.get('/', health);
router.get('/db', healthDb);

module.exports = router;
