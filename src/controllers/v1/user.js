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

  getProfileById: create(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).select(
      User.getProfileFields().join(' '),
    );

    res.json({ data: user });
  }),

  getProfiles: create(async (req, res) => {
    const { page = 1, per_page = 10 } = req.query;

    const users = await User.find({})
      .select(User.getProfileFields().join(' '))
      // eslint-disable-next-line camelcase
      .limit(per_page * 1)
      // eslint-disable-next-line camelcase
      .skip((page - 1) * per_page);

    const count = await User.countDocuments();

    res.json({
      data: {
        // eslint-disable-next-line camelcase
        totalPages: Math.ceil(count / per_page),
        currentPage: page,
        users,
      },
    });
  }),

  updateProfile: create(
    async (req, res) => {
      // eslint-disable-next-line object-curly-newline
      const { name, about, skills, title } = req.body;

      const user = await User.findByIdAndUpdate(
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

  updateSocials: create(
    async (req, res) => {
      const socials = res.locals.inputBody;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { socials },
        { new: true },
      ).select(User.getProfileFields().join(' '));
      res.json({ data: user });
    },
    {
      validation: {
        validators: validators.updateSocials,
        throwError: true,
      },
      inputs: ['website', 'github', 'linkedin', 'twitter'],
    },
  ),
};
