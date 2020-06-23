const express = require('express');

const router = express.Router();

const controller = require('../../../controllers/v1/github');

router.get('/repository', controller.getRepo);

module.exports = router;
