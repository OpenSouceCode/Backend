const create = require('../create');
const jwt = require('../../utils/jwt');
const config = require('../../config/index');
const passport = require('../../config/githubOauth');

module.exports = {
  githubAuth: create(async (req, res, next) => {
    const { redirectTo } = req.query;
    const state = JSON.stringify({ redirectTo });
    const authenticator = passport.authenticate('github', {
      scope: ['read:user', 'user:email', 'repo'],
      state,
      session: true,
    });
    authenticator(req, res, next);
  }),

  githubOAuthCallback: [
    passport.authenticate('github', {
      failureRedirect: `${config.FRONTEND_LOGIN_URL}?status=${config.STATUS.UNAUTHORIZED}`,
    }),
    create(async (req, res) => {
      const token = await jwt.sign(req.user.id);
      res.redirect(
        `${config.FRONTEND_LOGIN_URL}?status=${config.STATUS.OK}&token=${token}`,
      );
    }),
  ],
};
