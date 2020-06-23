const express = require('express');

const router = express.Router();

const controller = require('../../controllers/v1/index');
const githubRouter = require('./github');

router.get('/status', controller.getStatus);
router.use('/github', githubRouter);

module.exports = router;
