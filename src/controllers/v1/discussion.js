const create = require('../create');
const Discussion = require('../../models/Discussion');
const validators = require('../../validators/discussion');
const DiscussionComment = require('../../models/DiscussionComment');

module.exports = {
  postDiscussion: create(
    async (req, res) => {
      const { question, repository } = req.body;

      const newDiscussion = new Discussion({
        question,
        repository,
        userId: req.user.id,
      });

      const discussion = await newDiscussion.save();

      res.json({ data: discussion });
    },
    {
      validation: {
        validators: validators.postDiscussion,
        throwError: true,
      },
    },
  ),

  postComment: create(
    async (req, res) => {
      const { comment, discussionId } = req.body;

      const newDiscussionComment = new DiscussionComment({
        comment,
        discussionId,
        userId: req.user.id,
      });

      const discussionComment = await newDiscussionComment.save();

      res.json({ data: discussionComment });
    },
    {
      validation: {
        validators: validators.postComment,
        throwError: true,
      },
    },
  ),
};
