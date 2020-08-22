const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/user');

router.get('/profile', authenticator, controller.getProfile);

module.exports = router;
