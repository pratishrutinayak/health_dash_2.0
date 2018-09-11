var admin = require("firebase-admin");
var serviceAccount = require("./private_key/config.json");

//initialize firebase app API
try
{
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_URL
      });
} 
catch (err) 
{
  // we skip the "already exists" message which is
  // not an actual error when we're hot-reloading
  if (!/already exists/.test(err.message)) 
  {
    console.error('Firebase initialization error');
  }
}

module.exports = admin;