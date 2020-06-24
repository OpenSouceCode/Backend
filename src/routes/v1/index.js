const express = require('express');

const router = express.Router();

const controller = require('../../controllers/v1/index');

router.get('/status', controller.getStatus);

module.exports = router;
