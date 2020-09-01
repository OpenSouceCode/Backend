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

  getStarredRepos: create(async (req, res) => {
    const {
      sort = 'created ',
      direction = 'asc',
      page = 1,
      per_page = 20,
    } = req.query;
    const resp = await github.searchStarredRepos(req.accessToken, {
      sort,
      direction,
      page,
      per_page,
    });

    res.json(resp);
  }),

  getIssues: create(async (req, res) => {
    const {
      milestone,
      sort = 'created',
      direction = 'desc',
      assignee,
      page = 1,
      per_page = 20,
    } = req.query;
    const { owner, repo } = req.params;

    const resp = await github.searchIssues(req.accessToken, {
      milestone,
      sort,
      assignee,
      direction,
      owner,
      repo,
      page,
      per_page,
    });

    res.json(resp);
  }),

  getPullRequests: create(async (req, res) => {
    const { page = 1, per_page = 20 } = req.query;
    const { owner, repo } = req.params;

    const resp = await github.searchPullRequests(req.accessToken, {
      owner,
      repo,
      page,
      per_page,
    });

    res.json(resp);
  }),

  starRepo: create(async (req, res) => {
    const { owner, repo } = req.params;

    const resp = await github.starRepo(req.accessToken, {
      owner,
      repo,
    });

    res.json(resp);
  }),

  unstarRepo: create(async (req, res) => {
    const { owner, repo } = req.params;

    const resp = await github.unstarRepo(req.accessToken, {
      owner,
      repo,
    });

    res.json(resp);
  }),
};
