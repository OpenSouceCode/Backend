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
  PORT: getEnvVariable('PORT'),
  GITHUB: {
    ACCESS_TOKEN: getEnvVariable('GITHUB_ACCESS_TOKEN'),
    USERNAME: getEnvVariable('GITHUB_USERNAME'),
  },
  MONGODB_URI: getEnvVariable('MONGODB_URI'),
  CLIENT_ID: getEnvVariable('CLIENT_ID'),
  CLIENT_SECRET: getEnvVariable('CLIENT_SECRET'),
};

module.exports = config;
