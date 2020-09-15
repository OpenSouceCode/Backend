const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/discussion');

router.post('/', authenticator(), controller.postDiscussion);
router.post('/comment', authenticator(), controller.postComment);

module.exports = router;
