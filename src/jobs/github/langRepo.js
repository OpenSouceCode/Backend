const { CronJob } = require('cron');
const querystring = require('querystring');
const LANGUAGES = require('../../config/languages');
const createRepoJob = require('./createRepoJob');

const MAX_RETRIES = 10;
const MAX_SLEEP_RETRIES = 10;
const MAX_PAGES = 1;
const PER_PAGE_COUNT = 100;
const MAX_ISSUES = 5;
const MAX_ISSUES_RETRY = 3;

// eslint-disable-next-line arrow-body-style
const queryBuilder = (elem, page, perPage) => {
  return querystring.stringify({
    q: `language:${elem}`,
    page,
    per_page: perPage,
  });
};

const langRepoTask = createRepoJob({
  queryBuilder,
  list: LANGUAGES,
  type: 'Language',
  MAX_PAGES,
  MAX_SLEEP_RETRIES,
  MAX_RETRIES,
  PER_PAGE_COUNT,
  MAX_ISSUES,
  MAX_ISSUES_RETRY,
});

const langRepoJob = new CronJob('0 12 * * *', langRepoTask);

module.exports = {
  langRepoTask,
  langRepoJob,
};
