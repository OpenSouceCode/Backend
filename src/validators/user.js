const { body } = require('express-validator');

module.exports = {
  checkName: [
    body('name').isString().notEmpty().withMessage('Name is required'),
  ],
};
