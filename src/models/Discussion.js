const mongoose = require('mongoose');
const User = require('./User');

const DiscussionSchema = new mongoose.Schema({
  question: {
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
  repository: {
    type: String,
    required: true,
  },
});

DiscussionSchema.statics.getDiscussionFields = function () {
  return ['_id', 'question', 'user', 'date', 'name', 'repository'];
};

const Discussion = mongoose.model('Discussion', DiscussionSchema);

module.exports = Discussion;
