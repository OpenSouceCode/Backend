const { body } = require('express-validator');

module.exports = {
  postSkillTest: [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('image').isString().notEmpty().withMessage('Image is required'),
    body('description')
      .isString()
      .notEmpty()
      .withMessage('Description is required'),
  ],
  updateSkillTest: [
    body('name').isString().optional().withMessage('Name is required'),
    body('image').isString().optional().withMessage('Image is required'),
    body('description')
      .isString()
      .optional()
      .withMessage('Description is required'),
  ],
};
