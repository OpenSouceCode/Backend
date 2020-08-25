const { body } = require('express-validator');

module.exports = {
  updateProfile: [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('about').isString().withMessage('About should be a string'),
    body('skills')
      .isArray()
      .withMessage('Skills should be an array of strings'),
  ],
  updateSocials: [
    body('website').isURL().withMessage('website should be a URL'),
    body('github').isURL().withMessage('github handle should be a URL'),
    body('linkedin').isURL().withMessage('linkedin handle should be a URL'),
    body('twitter').isURL().withMessage('twitter handle should be a URL'),
  ],
};
