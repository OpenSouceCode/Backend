const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

const db = config.DB.URL;
const connectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  poolSize: config.DB.POOL_SIZE,
};

const connectDB = async () => {
  try {
    await mongoose.connect(db, connectionOptions);

    logger.info('MongoDB connected!');
  } catch (err) {
    logger.error(err);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
