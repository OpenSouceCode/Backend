const create = require('../create');
const User = require('../../models/User');

module.exports = {
  getProfile: create(async (req, res) => {
    const user = await User.findById(req.user.id).select(
      User.getProfileFields().join(' '),
    );

    res.json({ data: user });
  }),
};
