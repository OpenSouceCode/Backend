/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const axios = require('axios');
const { CronJob } = require('cron');
const querystring = require('querystring');
const { db } = require('../../firebase');
const config = require('../../config');
const logger = require('../../logger');

const pulls = db.collection('pulls');

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

const getRepoName = (fullName) => {
  let name = '';
  let slash = false;
  for (let x = 0; x < fullName.length; x += 1) {
    if (slash) name += fullName[x];
    if (fullName[x] === '/') slash = true;
  }
  return name;
};

const fetchAndStorePR = (fullName) =>
  new Promise((resolve, reject) => {
    axios
      .get(`https://api.github.com/repos/${fullName}/pulls`)
      .then((response) => {
        const arr = response.data;
        const length = arr.length < 10 ? arr.length : 10;
        for (let x = 0; x < length; x += 1) {
          const PR = {
            id: arr[x].id,
            node_id: arr[x].node_id,
            html_url: arr[x].html_url,
            state: arr[x].state,
            labels: arr[x].labels,
            created_at: arr[x].created_at,
            number: arr[x].number,
            title: arr[x].title,
            body: arr[x].body,
            updated_at: arr[x].updated_at,
            closed_at: arr[x].closed_at,
            merged_at: arr[x].merged_at,
            user: arr[x].user,
          };
          const RepoName = getRepoName(fullName);
          pulls
            .doc(`${RepoName} [${x + 1} PR]`)
            .set(PR)
            .catch((err) => logger.error(err.message));
        }
        resolve();
      })
      .catch(async (err) => {
        if (err.response && err.response.status === 403) {
          const remainingReq = err.response.headers['x-ratelimit-remaining'];
          const resetTime = err.response.headers['x-ratelimit-reset'];
          if (remainingReq <= 0 && resetTime) {
            const utcSeconds = Number(resetTime);
            const left = utcSeconds * 1000 - Date.now() + 5000;
            logger.info(`Sleeping for ${Math.floor(left / (1000 * 60))} mins`);
            await sleep(left);
            logger.info('\tAwake Now');
          }
        }
        reject(err);
      });
  });

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

const PrRepoJob = (repos) =>
  new Promise(async (resolve, reject) => {
    await repos.forEach(async (repo) => {
      await fetchAndStorePR(repo).catch((err) => {
        reject(err);
      });
    });
    resolve();
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
          await PrRepoJob(data.items).catch((err) => {
            logger.error(err);
            PrRepoJob(data.items);
          });
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
