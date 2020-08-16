const express = require('express');
const axios = require('axios');
const config = require('../config');
const setAuthToken = require('../utils/setAuthToken');

const router = express.Router();

const clientId = config.CLIENT_ID;
const clientSecret = config.CLIENT_SECRET;

router.get('/auth', (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user`,
  );
});

router.get('/oauth-callback', (req, res) => {
  const body = {
    client_id: clientId,
    client_secret: clientSecret,
    code: req.query.code,
  };
  const options = {
    headers: {
      Accept: 'application/json',
    },
  };

  axios
    .post('https://github.com/login/oauth/access_token', body, options)
    .then((response) => response.data.access_token)
    .then((_token) => {
      const accessToken = _token;

      // Set Authorization header and store token in localStorage
      setAuthToken(accessToken);

      res.redirect('/');
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

module.exports = router;
