const create = require('../create');
const github = require('../../utils/github');

module.exports = {
  getRepos: create(async (req, res) => {
    const {
      query = 'is:public',
      sort = 'stars',
      order = 'desc',
      page = 1,
      per_page = 20,
    } = req.query;

    const resp = await github.searchRepos(req.accessToken, {
      query,
      sort,
      order,
      page,
      per_page,
    });

    res.json(resp);
  }),
};
