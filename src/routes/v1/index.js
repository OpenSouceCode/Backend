const express = require('express');

const router = express.Router();

const controller = require('../../controllers/v1/index');
const authRouter = require('./auth');

router.use('/auth', authRouter);
router.get('/status', controller.getStatus);

module.exports = router;
