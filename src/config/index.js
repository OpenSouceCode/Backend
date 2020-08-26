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
    CLIENT_ID: getEnvVariable('GITHUB_CLIENT_ID'),
    SECRET: getEnvVariable('GITHUB_CLIENT_SECRET'),
  },
  DB: {
    URL: getEnvVariable('DB_URL'),
    POOL_SIZE: getEnvVariable('DB_POOLSIZE'),
  },
  JWT: {
    SECRET: getEnvVariable('JWT_SECRET'),
    EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN'),
  },
  API_URL: getEnvVariable('API_URL'),
  FRONTEND_LOGIN_URL: getEnvVariable('FRONTEND_LOGIN_URL'),
};

module.exports = config;
