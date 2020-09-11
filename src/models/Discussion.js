const mongoose = require('mongoose');
const User = require('./User');

const DiscussionSchema = new mongoose.Schema({
  question: {
    type: String,
  },
  user: {
    type: User,
  },
  date: {
    type: Date,
  },
  name: {
    type: String,
  },
  repository: {
    type: String,
  },
});

DiscussionSchema.statics.getProfileFields = function () {
  return ['_id', 'question', 'user', 'date', 'name', 'repository'];
};

const Discussion = mongoose.model('Discussion', DiscussionSchema);

module.exports = Discussion;
