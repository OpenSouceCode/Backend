const { CronJob } = require('cron');
const querystring = require('querystring');
const ORGANIZATIONS = require('../../config/organizations');
const createRepoJob = require('./createRepoJob');

const MAX_RETRIES = 10;
const MAX_SLEEP_RETRIES = 10;
const MAX_PAGES = 2;
const PER_PAGE_COUNT = 100;
const MAX_ISSUES = 5;
const MAX_ISSUES_RETRY = 3;

// eslint-disable-next-line arrow-body-style
const queryBuilder = (elem, page, perPage) => {
  return querystring.stringify({
    q: `org:${elem}`,
    page,
    per_page: perPage,
  });
};

const orgRepoTask = createRepoJob({
  queryBuilder,
  list: ORGANIZATIONS,
  type: 'Organization',
  MAX_PAGES,
  MAX_SLEEP_RETRIES,
  MAX_RETRIES,
  PER_PAGE_COUNT,
  MAX_ISSUES,
  MAX_ISSUES_RETRY,
});

const orgRepoJob = new CronJob('0 12 * * *', orgRepoTask);

module.exports = {
  orgRepoTask,
  orgRepoJob,
};
