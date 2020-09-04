const NodeCache = require('node-cache');

const genCacheKey = ({ userId, key, path }) => {
  if (userId) return `${userId}:${key}:${path}`;
  return `${key}:${path}`;
};

module.exports = { genCacheKey, mCache: new NodeCache({ stdTTL: 60 }) };
