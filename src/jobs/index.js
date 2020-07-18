const { langRepoJob } = require('./github/langRepo');
const { orgRepoJob } = require('./github/orgRepo');

langRepoJob.start();
orgRepoJob.start();
