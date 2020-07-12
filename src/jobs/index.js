const { langRepoJob } = require('./github/langRepo');
const { orgRepoJob } = require('./github/orgRepo');
const PRRepoJob = require('./github/prRepo');

langRepoJob.start();
orgRepoJob.start();
/*  Start storing the pull requests */
PRRepoJob.start();
