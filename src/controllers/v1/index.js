const create = require('../create');

module.exports = {
  getStatus: create((req, res) => {
    res.status(200).json({ status: 'Running' });
  }),
};
