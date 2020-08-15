const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  oAuth: {
    github: {
      profileUrl: {
        type: String,
        default: null,
      },
      accessToken: {
        type: String,
        default: null,
      },
    },
  },
  about: {
    title: {
      type: String,
    },
    bio: {
      type: String,
    },
    skills: {
      type: String,
    },
  },
  socialProfiles: {
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
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
