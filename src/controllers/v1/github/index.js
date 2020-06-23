const create = require('../../create');
const { repoJob } = require('../../../jobs/github');

module.exports = {
  getRepo: create(async (req, res) => {
    try {
      const data = await repoJob();
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }),
};
