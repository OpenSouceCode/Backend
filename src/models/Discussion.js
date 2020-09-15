const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  repository: {
    type: String,
    required: true,
  },
});

DiscussionSchema.statics.getDiscussionFields = function () {
  return ['_id', 'question', 'userId', 'date', 'name', 'repository'];
};

const Discussion = mongoose.model('Discussion', DiscussionSchema);

module.exports = Discussion;
