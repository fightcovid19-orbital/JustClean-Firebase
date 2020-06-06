const functions = require('firebase-functions');

const app = require('express')();

const { getAllComments, createComment } = require('./handlers/comments');
const { signup, login } = require('./handlers/users');
const { getCleaners } = require('./handles/cleaners')

const FBAuth = require('./util/fbAuth');

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

// Cleaner route
app.get('/cleaners', getCleaners);

exports.api = functions.https.onRequest(app);
