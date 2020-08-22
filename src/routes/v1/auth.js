const express = require('express');

const router = express.Router();

const controller = require('../../controllers/v1/auth');

router.get('/github', controller.githubAuth);
router.get('/github/callback', controller.githubOAuthCallback);

module.exports = router;
