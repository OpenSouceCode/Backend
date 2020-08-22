const createError = require('http-errors');
const jwt = require('../utils/jwt');
const User = require('../models/User');

const auth = async (req, _res, next) => {
  try {
    const header = req.get('Authorization');
    if (!header) {
      return next(createError(401, 'Unauthorized user.'));
    }
    const splitedHeader = header.split(' ');
    let token;
    if (splitedHeader.length === 2) {
      // eslint-disable-next-line prefer-destructuring
      token = splitedHeader[1];
    }

    const payload = await jwt.verify(token);

    if (!payload) {
      return next(createError(401, 'Unauthorized user.'));
    }

    const user = await User.findById(payload.sub).select(
      '_id oAuth.github.accessToken',
    );
    if (!user) {
      return next(createError(401, 'Unauthorized user.'));
    }

    req.user = user;
    req.accessToken = user.oAuth.github.accessToken;
    return next();
  } catch (error) {
    return next(createError(401, 'Unauthorized user.'));
  }
};

module.exports = auth;
