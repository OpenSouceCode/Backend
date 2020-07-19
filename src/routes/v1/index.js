const express = require('express');

const router = express.Router();

const controller = require('../../controllers/v1/index');
const { langRepoTask } = require('../../jobs/github/langRepo');
const { orgRepoTask } = require('../../jobs/github/orgRepo');

router.get('/status', controller.getStatus);
router.get('/lang', (req, res) => {
  langRepoTask();
  res.json('Started');
});
router.get('/org', (req, res) => {
  orgRepoTask();
  res.json('Started');
});

module.exports = router;
