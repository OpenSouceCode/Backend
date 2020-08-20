/* eslint-disable no-async-promise-executor */
const jwt = require('jsonwebtoken');

const config = require('../config');

module.exports = {
  sign: async (userId, email) =>
    new Promise(async (resolve, reject) => {
      try {
        const payload = { sub: userId, email };
        const token = jwt.sign(payload, config.JWT.SECRET, {
          expiresIn: config.JWT.EXPIRES_IN,
        });
        resolve(token);
      } catch (error) {
        reject(error);
      }
    }),
  verify: async (token) =>
    new Promise(async (resolve, reject) => {
      try {
        const payload = jwt.verify(token, config.JWT.SECRET);
        resolve(payload);
      } catch (error) {
        reject(error);
      }
    }),
};
