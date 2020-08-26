const { body } = require('express-validator');

module.exports = {
  updateProfile: [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('about').isString().withMessage('About should be a string'),
    body('title').isString().withMessage('Title should be a string'),
    body('skills')
      .isArray()
      .withMessage('Skills should be an array of strings'),
  ],
};
