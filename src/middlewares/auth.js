const createError = require('http-errors');
const jwt = require('../utils/jwt');
const User = require('../models/User');
const { STATUS } = require('../config');

const auth = (role) => async (req, _res, next) => {
  try {
    const header = req.get('Authorization');
    if (!header) {
      return next(createError(STATUS.UNAUTHORIZED, 'Unauthorized user.'));
    }
    const splitedHeader = header.split(' ');
    let token;
    if (splitedHeader.length === 2) {
      // eslint-disable-next-line prefer-destructuring
      token = splitedHeader[1];
    }

    const payload = await jwt.verify(token);

    if (!payload) {
      return next(createError(STATUS.UNAUTHORIZED, 'Unauthorized user.'));
    }

    const user = await User.findById(payload.sub).select(
      '_id role oAuth.github.accessToken',
    );
    if (!user) {
      return next(createError(STATUS.UNAUTHORIZED, 'Unauthorized user.'));
    }

    req.user = user;
    req.accessToken = user.oAuth.github.accessToken;

    if (role && req.user.role !== role) {
      return next(createError(STATUS.FORBIDDEN, 'Forbidden user.'));
    }

    return next();
  } catch (error) {
    return next(createError(STATUS.UNAUTHORIZED, 'Unauthorized user.'));
  }
};

module.exports = auth;
