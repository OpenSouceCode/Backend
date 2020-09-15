const mongoose = require('mongoose');
const { body } = require('express-validator');

module.exports = {
  postDiscussion: [
    body('question').isString().notEmpty().withMessage('Question is required'),
    body('repository')
      .isString()
      .withMessage('Repository ID should be a string'),
  ],
  postComment: [
    body('comment').isString().notEmpty().withMessage('Comment is required'),
    body('discussionId').custom((discussionId) => {
      if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new Error('discussionId should be a mongoose ObjectId');
      }
    }),
  ],
};
