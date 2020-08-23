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

  getIssues: create(async (req, res) => {
    const {
      milestone = '*',
      sort = 'stars',
      assignee = '*',
      page = 1,
      per_page = 20,
    } = req.query;
    const { owner, repos } = req.params;

    const resp = await github.searchIssues(req.accessToken, {
      milestone,
      sort,
      assignee,
      owner,
      repos,
      page,
      per_page,
    });

    res.json(resp);
  }),

  getPullRequests: create(async (req, res) => {
    const { page = 1, per_page = 20 } = req.query;
    const { owner, repos } = req.params;

    const resp = await github.searchPullRequests(req.accessToken, {
      owner,
      repos,
      page,
      per_page,
    });

    res.json(resp);
  }),
};
