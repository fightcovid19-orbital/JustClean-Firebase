const functions = require('firebase-functions');

const app = require('express')();

const { getAllComments, createComment } = require('./handlers/comments');
const { signup, login } = require('./handlers/users');

const firebase = require('firebase');
firebase.initializeApp(config);

const FBAuth = require('./util/fbAuth');

app.get('/cleaners', (req, res) => {
    db.collection('cleaners').get()
        .then(data => {
            let cleaners = [];
            data.forEach(doc => {
                cleaners.push({
                    cleanerId: doc.id,
                    cleanerName: doc.data().cleanerName,
                    hiredCount: doc.data().hiredCount,
                    likeCount: doc.data().likeCount,
                    unlikeCount: doc.data().unlikeCount,
                    createdAt: doc.data().createdAt,
                });
            });
            return res.json(cleaners);
        })
        .catch(err => console.error(err))
});

// Comment route
// get cleanner's all comment
app.get('/comments', getAllComments);
// create comment
app.post('/comment', FBAuth, createComment);

//User route
// Signup
app.post('/signup', signup);
// login
app.post('/login', login);

exports.api = functions.https.onRequest(app);
