/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const axios = require('axios');
const { CronJob } = require('cron');
const querystring = require('querystring');
const { db } = require('../../firebase');
const config = require('../../config');
const logger = require('../../logger');

const FIELDS_TO_SAVE = [
  'id',
  'node_id',
  'full_name',
  'http_url',
  'description',
  'created_at',
  'updated_at',
  'pushed_at',
  'git_url',
  'ssh_url',
  'homepage',
  'language',
  'license',
  'forks',
  'open_issues',
  'watchers',
  'default_branch',
];

const LANGUAGES = [
  'javascript',
  'java',
  'c',
  'cpp',
  'go',
  'python',
  'php',
  'css',
  'html',
  'swift',
  'kotlin',
  'typescript',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const storeRepo = async (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const batch = db.batch();

      for (const elem of data) {
        const cloneElem = {};
        for (const key of FIELDS_TO_SAVE) {
          if (elem[key]) cloneElem[key] = elem[key];
        }
        const ref = db.collection('repositories').doc(`${cloneElem.node_id}`);
        batch.set(ref, cloneElem);
      }

      await batch.commit();
      resolve();
    } catch (error) {
      reject(error);
    }
  });

const fetchRepos = async (query) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(
        `https://api.github.com/search/repositories?${query}`,
        {
          auth: {
            username: config.GITHUB.USERNAME,
            password: config.GITHUB.ACCESS_TOKEN,
          },
        },
      );
      const { data, headers } = response;
      let remainingReq = headers['x-ratelimit-remaining'];
      let resetTime = headers['x-ratelimit-reset'];
      const { link } = headers;
      let hasNextPage = false;

      if (!(data && data.items)) {
        reject(new Error('Data items does not exist.'));
      }

      if (link) {
        const linksArray = link.split(',');
        for (const elem of linksArray) {
          const linkArray = elem.split(';');
          if (linkArray.length > 1 && linkArray[1].includes('rel="next"')) {
            hasNextPage = true;
            break;
          }
        }
      }
      if (remainingReq !== undefined || remainingReq !== null) {
        remainingReq = parseInt(remainingReq, 10);
      }

      if (resetTime !== undefined || resetTime !== null) {
        resetTime = parseInt(resetTime, 10);
      }

      if (remainingReq <= 0 && resetTime) {
        resolve({ data, resetTime, hasNextPage });
      } else {
        resolve({ data, hasNextPage });
      }
    } catch (error) {
      reject(error);
    }
  });

const langRepoTask = async () => {
  try {
    logger.info('Starting Language Repository Job');
    let totalRetries = 0;
    const det = {};

    for (const lang of LANGUAGES) {
      let hasNextPage = true;
      let page = 1;
      let langRetries = 0;
      logger.info(`Lang: ${lang}`);
      det[lang] = 0;

      do {
        logger.info(`\tPage: ${page}`);
        const query = querystring.stringify({
          q: `language:${lang}`,
          sort: 'sort',
          page,
          per_page: 100,
        });
        try {
          logger.info('\tFetching...');
          const {
            data,
            resetTime,
            hasNextPage: _hasNextPage,
          } = await fetchRepos(query);
          if (resetTime) {
            const delayTime = resetTime * 1000 - Date.now() + 5000;
            langRetries += 1;
            logger.info(`\tSleeping for: ${delayTime}`);
            await sleep(delayTime);
            logger.info('\tAwake now');
          }
          logger.info(`\tFetched: ${data.items.length}`);
          det[lang] += data.items.length;
          hasNextPage = _hasNextPage;
          logger.info(`\thasNextPage: ${hasNextPage}`);
          await storeRepo(data.items);
          page += 1;
        } catch (error) {
          logger.error(error);
          totalRetries += 1;
          logger.info(`\tRetrying: ${totalRetries}`);
        }
      } while (hasNextPage && totalRetries < 10 && langRetries < 10);
    }

    logger.info('Language Repository Job Completed');
    logger.info(`${JSON.stringify(det)}`);
    return det;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

const langRepoJob = new CronJob(
  '0 00,02,04,06,08,10,12,14,16,18,20,22 * * *',
  langRepoTask,
);

module.exports = {
  langRepoJob,
};
