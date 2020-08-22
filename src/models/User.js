const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
  },
  oAuth: {
    github: {
      id: {
        type: String,
      },
      node_id: {
        type: String,
      },
      profileUrl: {
        type: String,
      },
      accessToken: {
        type: String,
      },
      refreshToken: {
        type: String,
      },
      username: {
        type: String,
      },
      avatar_url: {
        type: String,
      },
      email: {
        type: String,
      },
    },
  },
});

UserSchema.statics.getProfileFields = function () {
  return ['_id', 'name', 'profileImage'];
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
