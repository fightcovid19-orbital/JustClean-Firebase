const functions = require('firebase-functions');

const app = require('express')();

const {
    getAllComments, 
    createComment, 
    getComment,
    custReplyComment ,
    cleanerReplyComment,
    deleteComment
} = require('./handlers/comments');

const { 
    signup, 
    login 
} = require('./handlers/users');

const { 
    getCleaners, 
    uploadCleanerImage,
    addCleanerDetails ,
    getAuthenticatedCleaner,
    likeCleaner,
    cancleLikeCleaner,
    unlikeCleaner,
    cancleUnlikeCleaner
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
// get cleaner's one comment
app.get('/comment/:commentId', getComment);
// customer create replies
app.post('/comment/:commentId/reply', custFbAuth, custReplyComment);
// cleaner create replies
app.post('/comment/:commentId/reply', custFbAuth, cleanerReplyComment);
// delete comment;
app.delete('/comment/:commentId', custFbAuth, deleteComment);

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
app.get('/customer', custFbAuth, getAuthenticatedCust);

// Cleaner route
app.get('/cleaners', getCleaners);
// upload image
app.post('/cleaner/image', cleanerFbAuth, uploadCleanerImage);
// cleaner details
app.post('/cleaner', cleanerFbAuth, addCleanerDetails);
// own details
app.get('/cleaner', cleanerFbAuth, getAuthenticatedCleaner);
// like cleaner
app.get('/cleaner/:cleanerName/like', custFbAuth, likeCleaner);
// cancle like cleaner
app.get('/cleaner/:cleanerName/cancleLike', custFbAuth, cancleLikeCleaner);
// unlike cleaner
app.get('/cleaner/:cleanerName/unlike', custFbAuth, unlikeCleaner);
// cancle Unlike cleaner
app.get('/cleaner/:cleanerName/cancleUnlike', custFbAuth, cancleUnlikeCleaner);

exports.api = functions.https.onRequest(app);
