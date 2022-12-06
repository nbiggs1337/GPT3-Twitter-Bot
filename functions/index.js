const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Gives access to Firestore DB for access tokens
// Gives us Twitter auth tokens securely
admin.initializeApp();
const dbRef = admin.firestore().doc('tokens/demo');

//Connect to Twitter API - create instance
const TwitterAPI = require('twitter-api-v2').default;
const twitterClient = new TwitterAPI({
    clientId: 'ekt3Q2ZIdlpfdEFuZGt1QlIzSWU6MTpjaQ',
    clientSecret: 'paEb26DrcOTF17ZZylw_dYCl1ROpKqBIf5dWQ4qX0PU5_UcHid'
});

const cbURL = "http://localhost:5000/twittergpt-f7369/us-central1/callback"


exports.auth = functions.https.onRequest((req, res) => {});

exports.callback = functions.https.onRequest((req, res) => {});

exports.tweet = functions.https.onRequest((req, res) => {});
