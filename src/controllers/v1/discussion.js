const create = require('../create');
const User = require('../../models/User');
const Discussion = require('../../models/Discussion');
const DiscussionComment = require('../../models/DiscussionComment');
const validators = require('../../validators/discussion');
const ReportDiscussion = require('../../models/ReportDiscussion');
const ReportDiscussionComment = require('../../models/ReportDiscussionComment');

module.exports = {
  getDiscussions: create(async (req, res) => {
    const { page = 1, per_page = 10 } = req.query;

    const discussions = await Discussion.find({})
      .populate('userId', User.getUserIdFields().join(' '))
      .select(Discussion.getDiscussionFields().join(' '))
      // eslint-disable-next-line camelcase
      .limit(per_page * 1)
      // eslint-disable-next-line camelcase
      .skip((page - 1) * per_page);

    const count = await Discussion.countDocuments();

    res.json({
      data: {
        // eslint-disable-next-line camelcase
        totalPages: Math.ceil(count / per_page),
        currentPage: page,
        discussions,
      },
    });
  }),

  getDiscussionByRepoId: create(async (req, res) => {
    const { repoId } = req.params;

    const discussion = await Discussion.find({ repository: repoId })
      .populate('userId', User.getUserIdFields().join(' '))
      .select(Discussion.getDiscussionFields().join(' '));

    res.json({ data: discussion });
  }),

  getComments: create(async (req, res) => {
    // eslint-disable-next-line camelcase
    const { discussion_id } = req.params;
    const { page = 1, per_page = 10 } = req.query;

    const discussionComments = await DiscussionComment.find({
      discussionId: discussion_id,
    })
      .populate('userId', User.getUserIdFields().join(' '))
      .select(DiscussionComment.getDiscussionCommentFields().join(' '))
      // eslint-disable-next-line camelcase
      .limit(per_page * 1)
      // eslint-disable-next-line camelcase
      .skip((page - 1) * per_page);

    const count = await DiscussionComment.find({
      discussionId: discussion_id,
    }).countDocuments();

    res.json({
      data: {
        // eslint-disable-next-line camelcase
        totalPages: Math.ceil(count / per_page),
        currentPage: page,
        discussionComments,
      },
    });
  }),

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

  reportDiscussion: create(
    async (req, res) => {
      const { reason } = req.body;
      const { discussionId } = req.params;
      const userId = req.user.id;

      const newReportDiscussion = new ReportDiscussion({
        reason,
        discussionId,
        userId,
      });

      const reportDiscussion = await newReportDiscussion.save();

      res.json({ data: reportDiscussion });
    },
    {
      validation: {
        validators: validators.reportDiscussion,
        throwError: true,
      },
    },
  ),

  reportDiscussionComment: create(
    async (req, res) => {
      const { reason } = req.body;
      const discussionCommentId = req.params.commentId;
      const userId = req.user.id;

      const newReportDiscussionComment = new ReportDiscussionComment({
        reason,
        discussionCommentId,
        userId,
      });

      const reportDiscussionComment = await newReportDiscussionComment.save();

      res.json({ data: reportDiscussionComment });
    },
    {
      validation: {
        validators: validators.reportDiscussionComment,
        throwError: true,
      },
    },
  ),
};
