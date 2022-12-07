Here are the contents of index.js w/o my keys

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Gives access to Firestore DB for access tokens
// Gives us Twitter auth tokens securely
admin.initializeApp();
const dbRef = admin.firestore().doc('tokens/demo');

//Connect to Twitter API - create instance
const TwitterAPI = require('twitter-api-v2').default;
const twitterClient = new TwitterAPI({
    clientId: '***** token here *****',
    clientSecret: '***** token here *****'
});

const cbURL = "*** Firestore callback URL HERE ***"

// Step 1 - Auth accounts
exports.auth = functions.https.onRequest(async (req, res) => {
    const { url, codeVerifier, state} = twitterClient.generateOAuth2AuthLink(
        cbURL,
        { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
    );
    
    //store verifier in Firebase above
    await dbRef.set({ codeVerifier, state });
    
    res.redirect(url);
    
});

// Step 2 - Callback off auth
exports.callback = functions.https.onRequest(async (req, res) => {
    
    // Get tokens stored in Firebase from twitter's URL
    const { state, code } = req.query;
    
    // Pull storedTokens from Firebase
    const dbSnapshot = await dbRef.get();
    const { codeVerifier, state: storedState } = dbSnapshot.data()
    
    if ( state !== storedState ) { // if invalid = invalidate req
        return res.status(400).send("Auth Failed - Invalid tokens")
    } else { 
        //Login with TwitterClient
        const {
            client: loggedClient,
            accessToken,
            refreshToken
        } = await twitterClient.loginWithOAuth2({
            code, 
            codeVerifier,
            redirectUri: cbURL
        });
        
        //Store freshtokens in Firebase
        await dbRef.set({ accessToken, refreshToken })
        
        // Respond with 200 success
        res.sendStatus(200);
        
    }
    
});

// Step 3 - Tweet BACK
exports.tweet = functions.https.onRequest(async (req, res) => {
    
    //Grab tokens from db
    const { refreshToken } = (await dbRef.get().data());
    
    //Safety - Refresh stored access token - then save
    const {
        client: refreshedClient,
        accessToken,
        refreshToken: newRefreshToken
    } = await twitterClient.refreshOAuth2Token(refreshToken);
    
    await dbRef.set({ accessToken, refreshToken: newRefreshToken });
    
    
    //Now connect to twitter - testing w/ returning profile data. 
    const { data } = await refreshedClient.v2.me;
    
    res.send(data)
    
});
