const { CronJob } = require('cron');
const axios = require('axios');
const { db } = require('../../firebase');
const logger = require('../../logger');
const repoCache = db.collection('repoCache').doc('lastRepoName');
const pulls = db.collection('pulls');
const repos = db.collection('repositories').orderBy('node_id','asc');

const sleep = time => new Promise(resolve => setTimeout(resolve, time)); 

const getRepoName = fullName => {
  let name = '';
  let slash = false;
  for (let x = 0; x < fullName.length; x += 1) {
    if (slash) name += fullName[x];
    if (fullName[x] === '/') slash = true;
  }
  return name;
};

const fetchPR = fullName =>
 new Promise((resolve, reject) =>{
     axios
    .get(`https://api.github.com/repos/${fullName}/pulls`)
    .then(response => {
      let remainingReq = response.headers['x-ratelimit-remaining'];
      let resetTime = response.headers['x-ratelimit-reset'];
      console.log(remainingReq);
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
          .doc(`${RepoName} [${x + 1}th PR]`)
          .set(PR)
          .catch((err) => console.log(err.message));
      }
      resolve();
    })
    .catch(async err => {
      if(err.response && err.response.status === 403){
        if(remainingReq <= 0 && resetTime){
          let utcSeconds = Number(response.headers['x-ratelimit-reset'])
          var left = (utcSeconds * 1000 - Date.now() + 5000);
          logger.info(`Sleeping for ${Math.floor(left/(1000*60))} mins`);
          await sleep(left);
        }
      }
      reject(err);
    });    
})

const getRepo = lastName =>
new Promise((resolve, reject) =>{
  repos
   .startAfter(lastName)
   .limit(100)
   .get()
   .then(snapshot =>{
     let length = snapshot.size;
     snapshot.forEach(async doc => {
       let fullName = doc.data().full_name;
       lastName = fullName;
       await fetchPR(fullName)
              .catch(async err =>{
                console.log(err.message, err.response.status)
                await fetchPR(fullName);
              });
     })
     resolve(lastName, length)
   })
   .catch(err =>{
    reject(err);
   })
})

const execute = async lastName =>{
  for(var x=1;x<=120;x++){
    await getRepo(lastName)
    .then((lastNameret, length) =>{
      if(length < 100){
        x = 120;
      }
      lastName = lastNameret;
    })
    .catch(err =>{
      console.log(err);
    })
    if(x === 120){
      repoCache.set({lastName})
    }
  }
}

const PrRepoTask = () =>{
  repoCache.get().then(doc => execute(doc.data().lastName)).catch(err =>{
    console.log(err);
    execute('');
  });
}

/* Run one time a day at 3pm */
module.exports = new CronJob('0 15 * * *', PrRepoTask);