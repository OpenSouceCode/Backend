/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const axios = require('axios');
const querystring = require('querystring');
const config = require('../../config');
const logger = require('../../logger');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

const repoJob = async () => {
  try {
    const languages = ['javascript', 'java', 'c', 'cpp'];
    let totalRetries = 0;
    const allData = {};

    for (const lang of languages) {
      let hasNextPage = true;
      let page = 1;
      let fullData = [];
      let langRetries = 0;
      logger.info(`Lang: ${lang}`);

      do {
        logger.info(`\tPage: ${page}`);
        const query = querystring.stringify({
          q: `language:${lang}`,
          sort: 'sort',
          page,
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
          fullData = fullData.concat(data.items);
          hasNextPage = _hasNextPage;
          page += 1;
          logger.info(`\thasNextPage: ${hasNextPage}`);
          if (page >= 10) break;
        } catch (error) {
          logger.error(error);
          totalRetries += 1;
          logger.info(`\tRetrying: ${totalRetries}`);
        }
      } while (hasNextPage && totalRetries < 10 && langRetries < 10);
      allData[lang] = fullData;
    }

    const det = {};
    for (const key of Object.keys(allData)) {
      det[key] = allData[key].length;
    }
    return det;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

module.exports = {
  repoJob,
};
