const admin = require('firebase-admin');

const serviceAccount = require('../keys/firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://oscapp2020.firebaseio.com',
});

module.exports = { admin, db: admin.firestore() };
