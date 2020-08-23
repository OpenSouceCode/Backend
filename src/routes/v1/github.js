const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/github');

router.get('/repositories', authenticator, controller.getRepos);
router.get('/issues/:owner/:repos', authenticator, controller.getIssues);

module.exports = router;
