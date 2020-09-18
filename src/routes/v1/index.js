const express = require('express');

const router = express.Router();

const controller = require('../../controllers/v1/index');
const authRouter = require('./auth');
const userRouter = require('./user');
const githubRouter = require('./github');
const discussionRouter = require('./discussion');
const skillTestRouter = require('./skillTest');

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/github', githubRouter);
router.use('/discussion', discussionRouter);
router.use('/skill-test', skillTestRouter);
router.get('/status', controller.getStatus);

module.exports = router;
