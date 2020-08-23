const querystring = require('querystring');
const axios = require('axios');

const BASE_URL = 'https://api.github.com';

const http = axios.create({ baseURL: BASE_URL });

module.exports = {
  // eslint-disable-next-line camelcase, object-curly-newline
  searchRepos: async (accessToken, { query, sort, order, page, per_page }) =>
    new Promise(async (resolve, reject) => {
      try {
        const queryStr = querystring.stringify({
          q: query,
          sort,
          order,
          page,
          per_page,
        });
        const resp = await http.get(`/search/repositories?${queryStr}`, {
          headers: { Authorization: `token ${accessToken}` },
        });
        const { link } = resp.headers;
        let hasNextPage = false;

        if (link) {
          const linksArray = link.split(',');
          // eslint-disable-next-line no-restricted-syntax
          for (const elem of linksArray) {
            const linkArray = elem.split(';');
            if (linkArray.length > 1 && linkArray[1].includes('rel="next"')) {
              hasNextPage = true;
              break;
            }
          }
        }

        resolve({ data: resp.data, hasNextPage });
      } catch (error) {
        reject(error);
      }
    }),

  searchIssues: async (
    accessToken,
    // eslint-disable-next-line camelcase, object-curly-newline
    { milestone, sort, assignee, owner, repos, page, per_page },
  ) => {
    // eslint-disable-next-line no-new
    new Promise(async (resolve, reject) => {
      try {
        const queryStr = querystring.stringify({
          milestone,
          sort,
          assignee,
          page,
          per_page,
        });

        const resp = await http.get(
          `/repos/${owner}/${repos}/issues?${queryStr}`,
          {
            headers: { Authorization: `token ${accessToken}` },
          },
        );

        const { link } = resp.headers;
        let hasNextPage = false;

        if (link) {
          const linksArray = link.split(',');
          // eslint-disable-next-line no-restricted-syntax
          for (const elem of linksArray) {
            const linkArray = elem.split(';');
            if (linkArray.length > 1 && linkArray[1].includes('rel="next"')) {
              hasNextPage = true;
              break;
            }
          }
        }

        resolve({ data: resp.data, hasNextPage });
      } catch (error) {
        reject(error);
      }
    });
  },

  // eslint-disable-next-line camelcase, object-curly-newline
  searchPullRequests: async (accessToken, { owner, repos, page, per_page }) =>
    new Promise(async (resolve, reject) => {
      try {
        const queryStr = querystring.stringify({
          page,
          per_page,
        });
        const resp = await http.get(
          `/repos/${owner}/${repos}/pulls?${queryStr}`,
          {
            headers: { Authorization: `token ${accessToken}` },
          },
        );

        const { link } = resp.headers;
        let hasNextPage = false;

        if (link) {
          const linksArray = link.split(',');
          // eslint-disable-next-line no-restricted-syntax
          for (const elem of linksArray) {
            const linkArray = elem.split(';');
            if (linkArray.length > 1 && linkArray[1].includes('rel="next"')) {
              hasNextPage = true;
              break;
            }
          }
        }

        resolve({ data: resp.data, hasNextPage });
      } catch (error) {
        reject(error);
      }
    }),
};
