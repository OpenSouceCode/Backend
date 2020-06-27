/**
 * This file will contain all the configuration keys.
 * Throws error if in production and a key is not specified.
 */
const dotenv = require('dotenv');

dotenv.config();

const getEnvVariable = (key) => {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`ENVIREMENT VARIABLE '${key}' NOT SPECIFIED.`);
  }
  return value;
};

const config = {
  GITHUB: {
    ACCESS_TOKEN: getEnvVariable('GITHUB_ACCESS_TOKEN'),
    USERNAME: getEnvVariable('GITHUB_USERNAME'),
  },
};

module.exports = config;
