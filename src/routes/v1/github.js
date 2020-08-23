const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/github');

router.get('/repositories', authenticator, controller.getRepos);
router.get('/pulls/:owner/:repos', authenticator, controller.getPullRequests);

module.exports = router;
