const axios = require('axios');
const createError = require('http-errors');

const create = require('../create');
const jwt = require('../../utils/jwt');
const User = require('../../models/User');
const { githubAuth } = require('../../validators/auth');

module.exports = {
  githubAuth: create(
    async (_req, res) => {
      const { inputBody } = res.locals;
      const { accessToken } = inputBody;

      const resp = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${accessToken}` },
      });

      const userData = resp.data;
      console.log(userData);
      if (!(userData && userData.email && userData.id && userData.node_id)) {
        throw createError(404, 'User data does not exist.');
      }

      const existingUser = await User.findOne({ email: userData.email }).select(
        '_id name email',
      );

      let currentUser = existingUser;
      if (!currentUser) {
        currentUser = await User.create({
          name: userData.name,
          email: userData.email,
          profileImage: userData.avatar_url,
          oAuth: {
            github: {
              id: userData.id,
              node_id: userData.node_id,
              profileUrl: userData.html_url,
              accessToken,
              username: userData.login,
              avatar_url: userData.avatar_url,
            },
          },
        });
      }

      const token = await jwt.sign(currentUser.id, currentUser.email);
      res.setHeaders('token', token);
      return res.json({ token });
    },
    {
      validation: {
        validators: githubAuth,
        throwError: true,
      },
      inputs: ['accessToken'],
    },
  ),
};
