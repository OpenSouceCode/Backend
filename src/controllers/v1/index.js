const mongoose = require('mongoose');
const create = require('../create');
const { STATUS } = require('../../config/index');

module.exports = {
  getStatus: create((_req, res) => {
    if (mongoose.connection.readyState !== 1) {
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ status: 'DB not connected' });
      return;
    }

    res.status(STATUS.OK).json({ status: 'Running' });
  }),
};
