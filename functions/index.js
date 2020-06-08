const functions = require('firebase-functions');

const app = require('express')();

const { getAllComments, createComment } = require('./handlers/comments');
const { signup, login } = require('./handlers/users');

const { getCleaners, uploadCleanerImage } = require('./handlers/cleaners');
const { uploadCustImage } = require('./handlers/customers');

const custFbAuth = require('./util/custFbAuth');
const cleanerFbAuth = require('./util/cleanerFbAuth');

// Comment route
// get cleanner's all comment
app.get('/comments', getAllComments);
// create comment
app.post('/comment', custFbAuth, createComment);

//User route
// Signup
app.post('/signup', signup);
// login
app.post('/login', login);

//Customer route
// upload image
app.post('/customer/image', custFbAuth, uploadCustImage);

// Cleaner route
app.get('/cleaners', getCleaners);
// upload image
app.post('/cleaner/image', cleanerFbAuth, uploadCleanerImage);

exports.api = functions.https.onRequest(app);
