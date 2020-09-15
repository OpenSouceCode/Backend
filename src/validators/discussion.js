const { body } = require('express-validator');

module.exports = {
  postDiscussion: [
    body('question').isString().notEmpty().withMessage('Question is required'),
    body('repository')
      .isString()
      .withMessage('Repository ID should be a string'),
  ],
};
