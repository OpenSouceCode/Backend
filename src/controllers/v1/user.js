const create = require('../create');
const User = require('../../models/User');
const validators = require('../../validators/user');

module.exports = {
  getProfile: create(async (req, res) => {
    const user = await User.findById(req.user.id).select(
      User.getProfileFields().join(' '),
    );

    res.json({ data: user });
  }),

  updateProfile: create(async (req, res) => {
    create.options = {
      validation: {
        validators: validators.checkName,
        throwError: !req.body.name,
      },
    };

    if (create.options.validation.throwError) {
      res.json('Name is required!');
    }

    const { name } = req.body;

    const user = await User.findOneAndUpdate(
      req.user.id,
      {
        name,
      },
      { new: true },
    ).select(User.getProfileFields().join(' '));

    res.json({ data: user });
  }),
};
