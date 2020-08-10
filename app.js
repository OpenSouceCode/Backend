const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./src/logger');
const connectDB = require('./src/config/db');

const indexRouter = require('./src/routes');

// Start cron job
require('./src/jobs/index');

// Connect Database
connectDB();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, 'Page not found.'));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, _next) => {
  if (error instanceof createError.HttpError) {
    const obj = {
      message: error.message,
    };
    if (error.errors) {
      obj.errors = error.errors;
    }
    res.status(error.status).json(obj);
  } else {
    logger.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = app;
