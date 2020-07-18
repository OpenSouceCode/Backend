/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const axios = require('axios');
const querystring = require('querystring');
const { db } = require('../../firebase');
const config = require('../../config');
const logger = require('../../logger');
const FIELDS_TO_SAVE = require('../../config/repoFields');
const PR_FIELDS_TO_SAVE = require('../../config/prFields');
const ISSUE_FIELDS_TO_SAVE = require('../../config/issueFields');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const makeGHReq = (url) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(url, {
        auth: {
          username: config.GITHUB.USERNAME,
          password: config.GITHUB.ACCESS_TOKEN,
        },
      });

      const { data, headers } = response;
      let remainingReq = headers['x-ratelimit-remaining'];
      let resetTime = headers['x-ratelimit-reset'];
      const { link } = headers;
      let hasNextPage = false;

      if (!data) {
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

const fetchAndStoreIssues = (fullName, repoId, totalIssues) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = querystring.stringify({
        sort: 'created',
        direction: 'desc',
        per_page: totalIssues,
      });

      const { data, resetTime } = await makeGHReq(
        `https://api.github.com/repos/${fullName}/issues?${query}`,
      );
      if (resetTime) {
        const delayTime = resetTime * 1000 - Date.now() + 5000;
        logger.info(`\tSleeping for: ${delayTime}`);
        await sleep(delayTime);
        logger.info('\tAwake now');
      }
      const batch = db.batch();

      for (const elem of data) {
        const cloneElem = { lastFetched: new Date() };
        for (const key of ISSUE_FIELDS_TO_SAVE) {
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

        cloneElem.repo_id = repoId;
        cloneElem.repo_name = fullName;
        const ref = db.collection('issues').doc(`${cloneElem.node_id}`);
        batch.set(ref, cloneElem);
      }

      await batch.commit();
      resolve();

      resolve(data);
    } catch (error) {
      reject(error);
    }
  });

const IssueRepoJob = (repos, totalIssues, totalRetries) =>
  new Promise(async (resolve) => {
    try {
      let retries = 0;
      logger.info('\tStarting to fetch issue...');
      for (let i = 0; i < repos.length; i += 1) {
        try {
          logger.info(`\t\tFetching issue for repo ${i}`);
          await fetchAndStoreIssues(
            repos[i].full_name,
            repos[i].node_id,
            totalIssues,
          );
        } catch (error) {
          if (retries < totalRetries) {
            logger.info('Retrying issue...');
            retries += 1;
          } else throw error;
        }
      }
      resolve();
    } catch (error) {
      logger.error(error);
    }
  });

const fetchAndStorePR = (fullName, repoId, totalPr) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = querystring.stringify({
        sort: 'created',
        direction: 'desc',
        per_page: totalPr,
      });

      const { data, resetTime } = await makeGHReq(
        `https://api.github.com/repos/${fullName}/pulls?${query}`,
      );
      if (resetTime) {
        const delayTime = resetTime * 1000 - Date.now() + 5000;
        logger.info(`\tSleeping for: ${delayTime}`);
        await sleep(delayTime);
        logger.info('\tAwake now');
      }
      const batch = db.batch();

      for (const elem of data) {
        const cloneElem = { lastFetched: new Date() };
        for (const key of PR_FIELDS_TO_SAVE) {
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

        cloneElem.repo_id = repoId;
        cloneElem.repo_name = fullName;
        const ref = db.collection('pulls').doc(`${cloneElem.node_id}`);
        batch.set(ref, cloneElem);
      }

      await batch.commit();
      resolve();

      resolve(data);
    } catch (error) {
      reject(error);
    }
  });

const PrRepoJob = (repos, totalPr, totalRetries) =>
  new Promise(async (resolve) => {
    try {
      let retries = 0;
      logger.info('\tStarting to fetch PR...');
      for (let i = 0; i < repos.length; i += 1) {
        try {
          logger.info(`\t\tFetching PR for repo ${i}`);
          await fetchAndStorePR(repos[i].full_name, repos[i].node_id, totalPr);
        } catch (error) {
          if (retries < totalRetries) {
            logger.info('Retrying PR...');
            retries += 1;
          } else throw error;
        }
      }
      resolve();
    } catch (error) {
      logger.error(error);
    }
  });

const fetchRepos = async (query) =>
  new Promise(async (resolve, reject) => {
    try {
      const { data, resetTime, hasNextPage } = await makeGHReq(
        `https://api.github.com/search/repositories?${query}`,
      );

      if (!(data && data.items)) {
        reject(new Error('Data items does not exist.'));
      }

      resolve({ data, resetTime, hasNextPage });
    } catch (error) {
      reject(error);
    }
  });

const createRepoJob = ({
  queryBuilder,
  list,
  type,
  MAX_PAGES,
  MAX_RETRIES,
  MAX_SLEEP_RETRIES,
  PER_PAGE_COUNT,
  MAX_ISSUES,
  MAX_ISSUES_RETRY,
}) => async () => {
  try {
    logger.info(`Starting ${type} Repository Job`);
    let totalRetries = 0;
    const det = {};

    for (const elem of list) {
      let hasNextPage = true;
      let page = 1;
      let langRetries = 0;
      logger.info(`${type}: ${elem}`);
      det[elem] = 0;

      do {
        logger.info(`\tPage: ${page}`);
        const query = queryBuilder(elem, page, PER_PAGE_COUNT);
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
          det[elem] += data.items.length;
          hasNextPage = _hasNextPage;
          logger.info(`\thasNextPage: ${hasNextPage}`);
          await storeRepo(data.items);
          await PrRepoJob(data.items, MAX_ISSUES, MAX_ISSUES_RETRY);
          await IssueRepoJob(data.items, MAX_ISSUES, MAX_ISSUES_RETRY);
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

    logger.info(`${type} Repository Job Completed`);
    logger.info(`${JSON.stringify(det)}`);
    return det;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

module.exports = createRepoJob;
