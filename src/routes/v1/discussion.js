const express = require('express');

const router = express.Router();

const authenticator = require('../../middlewares/auth');
const controller = require('../../controllers/v1/discussion');

router.get('/', authenticator(), controller.getDiscussions);
router.get('/:repoId', authenticator(), controller.getDiscussionByRepoId);
router.get('/:discussion_id/comments', authenticator(), controller.getComments);
router.post('/', authenticator(), controller.postDiscussion);
router.post('/comment', authenticator(), controller.postComment);
router.post('/:discussionId', authenticator(), controller.reportDiscussion);
router.post(
  '/:discussionId/comment/:commentId',
  authenticator(),
  controller.reportDiscussionComment,
);

module.exports = router;
