const mongoose = require('mongoose');
const User = require('./User');

const DiscussionCommentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  user: {
    type: User,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: true,
  },
});

DiscussionCommentSchema.statics.getDiscussionCommentFields = function () {
  return ['_id', 'comment', 'user', 'date', 'name'];
};

const DiscussionComment = mongoose.model(
  'DiscussionComment',
  DiscussionCommentSchema,
);

module.exports = DiscussionComment;
