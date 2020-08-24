const { body } = require('express-validator');

module.exports = {
  updateProfile: [
    body('name').isString().notEmpty().withMessage('Name is required'),
  ],
};
