const mongoose = require('mongoose');

const DiscussionCommentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  discussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

DiscussionCommentSchema.statics.getDiscussionCommentFields = function () {
  return ['_id', 'comment', 'userId', 'date'];
};

const DiscussionComment = mongoose.model(
  'DiscussionComment',
  DiscussionCommentSchema,
);

module.exports = DiscussionComment;
