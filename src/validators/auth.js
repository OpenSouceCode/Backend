const { body } = require('express-validator');

module.exports = {
  githubAuth: [
    body('accessToken')
      .trim()
      .isString()
      .notEmpty()
      .withMessage('Access token is required'),
  ],
};
