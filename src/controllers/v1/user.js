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

  updateProfile: create(
    async (req, res) => {
      // eslint-disable-next-line object-curly-newline
      const { name, about, skills, title } = req.body;

      const user = await User.findOneAndUpdate(
        req.user.id,
        {
          name,
          about,
          title,
          skills,
        },
        { new: true },
      ).select(User.getProfileFields().join(' '));

      res.json({ data: user });
    },
    {
      validation: {
        validators: validators.updateProfile,
        throwError: true,
      },
    },
  ),

  updateSocials: create(async (req, res) => {
    const socialURL = {};
    // eslint-disable-next-line no-return-assign
    Object.keys(req.body).forEach((key) => (socialURL[key] = req.body[key]));

    const user = await User.findById(req.user.id).select(
      User.getProfileFields().join(' '),
    );

    Object.keys(socialURL).forEach(
      // eslint-disable-next-line no-return-assign
      (key) => (user.socials[key] = socialURL[key]),
    );

    await user.save();

    res.json({ data: user });
  }),
};
