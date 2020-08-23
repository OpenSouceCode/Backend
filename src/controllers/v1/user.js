const create = require('../create');
const User = require('../../models/User');

module.exports = {
  getProfile: create(async (req, res) => {
    const user = await User.findById(req.user.id).select(
      User.getProfileFields().join(' '),
    );

    res.json({ data: user });
  }),

  updateProfile: create(async (req, res) => {
    const { profileImage } = req.body;

    const user = await User.findOneAndUpdate(req.user.id, {
      profileImage,
    }).select(User.getProfileFields().join(' '));
    res.json({ data: user });
  }),
};
