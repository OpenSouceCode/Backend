const create = require('../../create');
const { repoJob } = require('../../../jobs/github');
const logger = require('../../../logger');

module.exports = {
  getRepo: create(async (req, res) => {
    try {
      const data = await repoJob();
      res.json(data);
    } catch (error) {
      logger.log(error);
      res.status(500).send();
    }
  }),
};
