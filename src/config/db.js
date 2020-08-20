const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../logger');

const db = config.DB.URL;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    logger.info('MongoDB connected!');
  } catch (err) {
    logger.error(err);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
