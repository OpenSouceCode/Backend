const mongoose = require('mongoose');
const create = require('../create');

module.exports = {
  getStatus: create((_req, res) => {
    if (mongoose.connection.readyState !== 1) {
      res.status(500).json({ status: 'DB not connected' });
      return;
    }

    res.status(200).json({ status: 'Running' });
  }),
};
