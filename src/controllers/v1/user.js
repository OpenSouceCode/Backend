const create = require('../create');
const User = require('../../models/User');
const validators = require('../../validators/user');
const { STATUS } = require('../../config');

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
    const { page = 1, per_page: perPage = 10 } = req.query;

    const users = await User.find({})
      .select(User.getProfileFields().join(' '))
      .limit(perPage * 1)
      .skip((page - 1) * perPage);

    const count = await User.countDocuments();

    res.json({
      data: {
        totalPages: Math.ceil(count / perPage),
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

  updateAvatar: create(async (req, res) => {
    if (req.fileValidationError) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: req.fileValidationError });
    }
    if (!req.file) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: 'No file received!' });
    }

    const imagePath = req.file.path.split('/').slice(1).join('/');

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profileImage: imagePath,
      },
      { new: true },
    ).select(User.getProfileFields().join(' '));

    return res.json({ data: user });
  }),
};
