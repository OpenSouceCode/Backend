const express = require('express');

const router = express.Router();

const controller = require('../../controllers/v1/auth');

router.post('/github', controller.githubAuth);

module.exports = router;
