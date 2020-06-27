/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const axios = require('axios');
const { CronJob } = require('cron');
const querystring = require('querystring');
const { db } = require('../../firebase');
const config = require('../../config');
const logger = require('../../logger');
const ORGANIZATIONS = require('../../config/organizations');
const FIELDS_TO_SAVE = require('../../config/repoFields');

const MAX_RETRIES = 10;
const MAX_SLEEP_RETRIES = 10;
const MAX_PAGES = 2;
const PER_PAGE_COUNT = 100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const storeRepo = async (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const batch = db.batch();

      for (const elem of data) {
        const cloneElem = { lastFetched: new Date() };
        for (const key of FIELDS_TO_SAVE) {
          const splitKeys = key.split('.');
          if (
            splitKeys.length > 1 &&
            elem[splitKeys[0]] !== undefined &&
            elem[splitKeys[0]][splitKeys[1]] !== undefined
          ) {
            if (cloneElem[splitKeys[0]]) {
              cloneElem[splitKeys[0]][splitKeys[1]] =
                elem[splitKeys[0]][splitKeys[1]];
            } else {
              cloneElem[splitKeys[0]] = {
                [splitKeys[1]]: elem[splitKeys[0]][splitKeys[1]],
              };
            }
          }
          if (elem[key] !== undefined) cloneElem[key] = elem[key];
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

const orgRepoTask = async () => {
  try {
    logger.info('Starting Organization Repository Job');
    let totalRetries = 0;
    const det = {};

    for (const org of ORGANIZATIONS) {
      let hasNextPage = true;
      let page = 1;
      let langRetries = 0;
      logger.info(`Org: ${org}`);
      det[org] = 0;

      do {
        logger.info(`\tPage: ${page}`);
        const query = querystring.stringify({
          q: `org:${org}`,
          sort: 'sort',
          page,
          per_page: PER_PAGE_COUNT,
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
          det[org] += data.items.length;
          hasNextPage = _hasNextPage;
          logger.info(`\thasNextPage: ${hasNextPage}`);
          await storeRepo(data.items);
          page += 1;
          if (page > MAX_PAGES) break;
        } catch (error) {
          logger.error(error);
          totalRetries += 1;
          logger.info(`\tRetrying: ${totalRetries}`);
        }
      } while (
        hasNextPage &&
        totalRetries < MAX_RETRIES &&
        langRetries < MAX_SLEEP_RETRIES
      );
    }

    logger.info('Organization Repository Job Completed');
    logger.info(`${JSON.stringify(det)}`);
    return det;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

const orgRepoJob = new CronJob('0 02,06,10,14,18,22 * * *', orgRepoTask);

module.exports = {
  orgRepoJob,
};
