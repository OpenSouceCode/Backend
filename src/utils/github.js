const querystring = require('querystring');
const { Octokit } = require('@octokit/core');

module.exports = {
  // eslint-disable-next-line camelcase, object-curly-newline
  searchRepos: async (accessToken, { query, sort, order, page, per_page }) =>
    new Promise(async (resolve, reject) => {
      try {
        const octokit = new Octokit({
          auth: `${accessToken}`,
        });
        const queryStr = querystring.stringify({
          sort,
          order,
          page,
          per_page,
        });
        const resp = await octokit.request(
          `GET /search/repositories?${queryStr}`,
          {
            q: query,
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

  searchStarredRepos: async (
    accessToken,
    // eslint-disable-next-line camelcase, object-curly-newline
    { sort, direction, page, per_page },
  ) =>
    new Promise(async (resolve, reject) => {
      try {
        const octokit = new Octokit({
          auth: `${accessToken}`,
        });
        const queryStr = querystring.stringify({
          sort,
          direction,
          page,
          per_page,
        });

        const resp = await octokit.request(`GET /user/starred?${queryStr}`);

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
    { milestone, sort, direction, assignee, owner, repo, page, per_page },
  ) =>
    new Promise(async (resolve, reject) => {
      try {
        const octokit = new Octokit({
          auth: `${accessToken}`,
        });
        const obj = {
          sort,
          page,
          per_page,
          direction,
        };
        if (milestone) {
          obj.milestone = milestone;
        }

        if (assignee) {
          obj.assignee = assignee;
        }
        const queryStr = querystring.stringify(obj);

        const resp = await octokit.request(
          `GET /repos/{owner}/{repo}/issues?${queryStr}`,
          {
            owner,
            repo,
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

  // eslint-disable-next-line camelcase, object-curly-newline
  searchPullRequests: async (accessToken, { owner, repo, page, per_page }) =>
    new Promise(async (resolve, reject) => {
      try {
        const octokit = new Octokit({
          auth: `${accessToken}`,
        });
        const queryStr = querystring.stringify({
          page,
          per_page,
        });
        const resp = await octokit.request(
          `GET /repos/{owner}/{repo}/pulls?${queryStr}`,
          {
            owner,
            repo,
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

  // eslint-disable-next-line object-curly-newline
  starRepo: async (accessToken, { owner, repo }) =>
    new Promise(async (resolve, reject) => {
      try {
        const octokit = new Octokit({
          auth: `${accessToken}`,
        });

        const resp = await octokit.request('PUT /user/starred/{owner}/{repo}', {
          owner,
          repo,
        });

        resolve(resp.status);
      } catch (error) {
        reject(error);
      }
    }),

  // eslint-disable-next-line object-curly-newline
  unstarRepo: async (accessToken, { owner, repo }) =>
    new Promise(async (resolve, reject) => {
      try {
        const octokit = new Octokit({
          auth: `${accessToken}`,
        });

        const resp = await octokit.request(
          'DELETE /user/starred/{owner}/{repo}',
          {
            owner,
            repo,
          },
        );

        resolve(resp.status);
      } catch (error) {
        reject(error);
      }
    }),
};
