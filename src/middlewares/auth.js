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

    const user = await User.countDocuments(payload.sub);
    if (!user) {
      return next(createError(401, 'Unauthorized user.'));
    }

    req.user = { id: payload.sub };
    return next();
  } catch (error) {
    return next(createError(401, 'Unauthorized user.'));
  }
};

module.exports = auth;
