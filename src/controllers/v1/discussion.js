const create = require('../create');
const User = require('../../models/User');
const Discussion = require('../../models/Discussion');
const DiscussionComment = require('../../models/DiscussionComment');
const validators = require('../../validators/discussion');
const ReportDiscussionDetails = require('../../models/ReportDiscussionDetails');
const ReportDiscussionCommentDetails = require('../../models/ReportDiscussionCommentDetails');
const { STATUS } = require('../../config/index');

module.exports = {
  getDiscussions: create(async (req, res) => {
    const { page = 1, per_page: perPage = 10 } = req.query;

    const discussions = await Discussion.find({})
      .populate('userId', User.getUserIdFields().join(' '))
      .select(Discussion.getDiscussionFields().join(' '))
      .limit(perPage * 1)
      .skip((page - 1) * perPage);

    const count = await Discussion.countDocuments();

    res.json({
      data: {
        totalPages: Math.ceil(count / perPage),
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
    const { discussion_id: discussionId } = req.params;
    const { page = 1, per_page: perPage = 10 } = req.query;

    const discussionComments = await DiscussionComment.find({
      discussionId,
    })
      .populate('userId', User.getUserIdFields().join(' '))
      .select(DiscussionComment.getDiscussionCommentFields().join(' '))
      .limit(perPage * 1)
      .skip((page - 1) * perPage);

    const count = await DiscussionComment.find({
      discussionId,
    }).countDocuments();

    res.json({
      data: {
        totalPages: Math.ceil(count / perPage),
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

  reportDiscussionDetails: create(
    async (req, res) => {
      const { reason } = req.body;
      const { discussionId } = req.params;
      const userId = req.user.id;

      const hasReportDiscussionDetails = await ReportDiscussionDetails.findOne({
        userId,
        discussionId,
      });

      if (hasReportDiscussionDetails) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: 'Discussion already reported' });
      }

      const newReportDiscussionDetails = new ReportDiscussionDetails({
        reason,
        discussionId,
        userId,
      });

      const reportDiscussionDetails = await newReportDiscussionDetails.save();

      return res.json({ data: reportDiscussionDetails });
    },
    {
      validation: {
        validators: validators.reportDiscussionDetails,
        throwError: true,
      },
    },
  ),

  reportDiscussionCommentDetails: create(
    async (req, res) => {
      const { reason } = req.body;
      const { discussionId, commentId } = req.params;
      const userId = req.user.id;

      const hasReportDiscussionCommentDetails = await ReportDiscussionCommentDetails.findOne(
        {
          userId,
          discussionCommentId: commentId,
        },
      );

      if (hasReportDiscussionCommentDetails) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: 'Comment already reported' });
      }

      const newReportDiscussionCommentDetails = new ReportDiscussionCommentDetails(
        {
          reason,
          userId,
          discussionId,
          discussionCommentId: commentId,
        },
      );

      const reportDiscussionCommentDetails = await newReportDiscussionCommentDetails.save();

      return res.json({ data: reportDiscussionCommentDetails });
    },
    {
      validation: {
        validators: validators.reportDiscussionCommentDetails,
        throwError: true,
      },
    },
  ),
};
