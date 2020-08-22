const express = require('express');

const router = express.Router();

const controller = require('../../controllers/v1/index');
const authRouter = require('./auth');
const userRouter = require('./user');

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.get('/status', controller.getStatus);

module.exports = router;
