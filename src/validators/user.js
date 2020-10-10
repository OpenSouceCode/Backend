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
  updateSocials: [
    body('website').isURL().withMessage('Website should be a URL').optional(),
    body('github')
      .isURL()
      .withMessage('Github handle should be a URL')
      .optional(),
    body('linkedin')
      .isURL()
      .withMessage('Linkedin handle should be a URL')
      .optional(),
    body('twitter')
      .isURL()
      .withMessage('Twitter handle should be a URL')
      .optional(),
  ],
  updateAvatar: [
    body('profileImage')
      .isString()
      .notEmpty()
      .withMessage('Profile Image is required'),
  ],
};
