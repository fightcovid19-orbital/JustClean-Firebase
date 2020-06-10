const functions = require('firebase-functions');
const { db } = require('./util/admin');
const app = require('express')();

const {
    getAllComments,
    createComment,
    getComment,
    custReplyComment,
    cleanerReplyComment,
    deleteComment
} = require('./handlers/comments');

const {
    signup,
    login,
    deleteCleaner,
    markNotificationRead
} = require('./handlers/users');

const {
    getCleaners,
    uploadCleanerImage,
    addCleanerDetails,
    getAuthenticatedCleaner,
    likeCleaner,
    cancleLikeCleaner,
    unlikeCleaner,
    cancleUnlikeCleaner,
    getCleanerDetails // public route 
} = require('./handlers/cleaners');

const {
    uploadCustImage,
    addCustDetails,
    getAuthenticatedCust
} = require('./handlers/customers');

const custFbAuth = require('./util/custFbAuth');
const cleanerFbAuth = require('./util/cleanerFbAuth');

// Comment route
// get cleanner's all comment
app.get('/comments', getAllComments);
// create comment
app.post('/comment/:cleanerName', custFbAuth, createComment);
// get cleaner's one comment
app.get('/comment/:commentId', getComment);
// customer create replies
app.post('/comment/:commentId/custReply', custFbAuth, custReplyComment);
// cleaner create replies
app.post('/comment/:commentId/cleanerReply', cleanerFbAuth, cleanerReplyComment);
// delete comment;
app.delete('/comment/:commentId', custFbAuth, deleteComment);

//User route
// Signup
app.post('/signup', signup);
// login
app.post('/login', login);
// delete Account
app.delete('/deleteCleaner', cleanerFbAuth, deleteCleaner);

//Customer route
// upload image
app.post('/customer/image', custFbAuth, uploadCustImage);
// customer details
app.post('/customer', custFbAuth, addCustDetails);
// own details
app.get('/customer', custFbAuth, getAuthenticatedCust);
// mark notification read
app.post('/custNotifications', custFbAuth, markNotificationRead);

// Cleaner route
// get all cleaners
app.get('/cleaners', getCleaners);
// get cleaner
app.get('/cleaner/:cleanerName', getCleanerDetails);
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
// mark notification read
app.post('/cleanerNotifications', cleanerFbAuth, markNotificationRead);


exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions
    .firestore.document('likes/{id}')
    .onCreate(snapshot => {
        db.doc(`/cleaners/${snapshot.data().cleanerName}`)
            .get()
            .then(doc => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`)
                        .set({
                            createdAt: new Date().toISOString(),
                            recipient: doc.data().cleanerName,
                            sender: snapshot.data().userHandle,
                            type: 'like',
                            read: false
                        });
                }
            })
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return;
            });
    });

exports.deleteNotificationOnCancelLike = functions
    .firestore.document('likes/{id}')
    .onDelete(snapshot => {
        db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return;
            });
    });

// not sure
exports.createNotificationOnCustReply = functions
    .firestore.document('custReplies/{id}')
    .onCreate(snapshot => {
        db.doc(`/comments/${snapshot.data().commentId}`)
            .get()
            .then(doc => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`)
                        .set({
                            createdAt: new Date().toISOString(),
                            recipient: doc.data().userHandle,
                            sender: snapshot.data().userHandle,
                            type: 'reply',
                            read: false,
                            commentId: doc.id
                        });
                }
            })
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return;
            });
    });

exports.createNotificationOnCleanerReply = functions
    .firestore.document('cleanerReplies/{id}')
    .onCreate(snapshot => {
        db.doc(`/comments/${snapshot.data().commentId}`)
            .get()
            .then(doc => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`)
                        .set({
                            createdAt: new Date().toISOString(),
                            recipient: doc.data().userHandle,
                            sender: snapshot.data().userHandle,
                            type: 'reply',
                            read: false,
                            commentId: doc.id
                        });
                }
            })
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return;
            });
    });

exports.createNotificationOnComment = functions
    .firestore.document('comments/{id}')
    .onCreate(snapshot => {
        db.doc(`/cleaners/${snapshot.data().commentOn}`)
            .get()
            .then(doc => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`)
                        .set({
                            createdAt: new Date().toISOString(),
                            recipient: doc.data().cleanerName,
                            sender: snapshot.data().userHandle,
                            type: 'comment',
                            read: false
                        });
                }
            })
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return;
            });
    });

exports.deleteNotificationOnCancelComment = functions
    .firestore.document('comments/{id}')
    .onDelete(snapshot => {
        db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return;
            });
    });