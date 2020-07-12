const { CronJob } = require('cron');
const axios = require('axios');
const { db } = require('../../firebase');
const logger = require('../../logger');

function PrRepoTask() {
  return new Promise((resolve, reject) => {
    const repos = db.collection('repositories');
    const pulls = db.collection('pulls');
    logger.info('fetching Repos...');
    repos
      .get()
      .then((snapshot) => {
        logger.info('fetched all Repos');
        snapshot.forEach((doc) => {
          const { full_name: fullName } = doc.data();
          const getRepoName = () => {
            let name = '';
            let slash = false;
            for (let x = 0; x < fullName.length; x += 1) {
              if (slash) name += fullName[x];
              if (fullName[x] === '/') slash = true;
            }
            return name;
          };
          const RepoName = getRepoName();
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
                pulls
                  .doc(`${RepoName} [${x + 1}th PR]`)
                  .set(PR)
                  .catch((err) => logger.error(err.message));
              }
            })
            .catch((err) => {
              logger.error(err.message);
              reject(err);
            });
        });
        resolve();
      })
      .catch((err) => {
        logger.error(err);
        reject(err);
      });
  });
}

module.exports = new CronJob('0 00,04,08,12,16,20 * * *', PrRepoTask);
