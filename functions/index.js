const functions = require('firebase-functions');

const app = require('express')();

const { getAllComments, createComment } = require('./handlers/comments');
const { signup, login } = require('./handlers/users');

const { 
    getCleaners, 
    uploadCleanerImage,
    addCleanerDetails ,
    getAuthenticatedCleaner
} = require('./handlers/cleaners');

const { 
    uploadCustImage, 
    addCustDetails ,
    getAuthenticatedCust
} = require('./handlers/customers');

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
// customer details
app.post('/customer', custFbAuth, addCustDetails);
// own details
app.get('customer', custFbAuth, getAuthenticatedCust);

// Cleaner route
app.get('/cleaners', getCleaners);
// upload image
app.post('/cleaner/image', cleanerFbAuth, uploadCleanerImage);
// cleaner details
app.post('/customer', cleanerFbAuth, addCleanerDetails);
// own details
app.get('customer', cleanerFbAuth, getAuthenticatedCleaner);

exports.api = functions.https.onRequest(app);
