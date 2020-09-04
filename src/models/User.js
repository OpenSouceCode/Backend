const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  profileImage: {
    type: String,
  },
  about: {
    type: String,
  },
  title: {
    type: String,
  },
  skills: [{ type: String, trim: true }],
  socials: {
    website: {
      type: String,
    },
    github: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    twitter: {
      type: String,
    },
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
  return [
    '_id',
    'name',
    'profileImage',
    'about',
    'title',
    'skills',
    'socials',
    'role',
  ];
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
