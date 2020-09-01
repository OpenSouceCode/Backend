const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/github');

router.get('/repositories', authenticator, controller.getRepos);
router.put('/starred/:owner/:repo', authenticator, controller.starRepo);
router.delete('/starred/:owner/:repo', authenticator, controller.unstarRepo);
router.get('/pulls/:owner/:repo', authenticator, controller.getPullRequests);
router.get('/issues/:owner/:repo', authenticator, controller.getIssues);
router.get('/starred', authenticator, controller.getStarredRepos);

module.exports = router;
