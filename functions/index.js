const functions = require('firebase-functions');
const { db } = require('./util/admin');
const app = require('express')();

const {
    getAllComments,
    createComment,
    getComment,
    custReplyComment,
    cleanerReplyComment,
    deleteComment,
    deleteCustReply,
    deleteCleanerReply,
    updateComment
} = require('./handlers/comments');

const {
    signup,
    login,
    deleteCleaner,
    markNotificationRead
} = require('./handlers/users');

const {
    getHistories,
    createHistory
} = require('./handlers/history');

const {
    getReservation,
    createReservation,
    deleteReservation
} = require('./handlers/reservation');

const {
    getCleaners,
    uploadCleanerImage,
    addCleanerDetails,
    getAuthenticatedCleaner,
    getCleanerDetails, // public route 
    getCleanersByLocation
} = require('./handlers/cleaners');

const {
    likeCleaner,
    cancelLikeCleaner,
    unlikeCleaner,
    cancelUnlikeCleaner,
} = require('./handlers/likes');

const {
    uploadCustImage,
    addCustDetails,
    getAuthenticatedCust
} = require('./handlers/customers');

const custFbAuth = require('./util/custFbAuth');
const cleanerFbAuth = require('./util/cleanerFbAuth');

// Comment route
// get cleanner's all comment
app.get('/comments/:cleanerName', getAllComments);
// create comment
app.post('/comment/:cleanerName', custFbAuth, createComment);
// get cleaner's one comment
app.get('/comment/:commentId', getComment);
// customer create replies
app.post('/custReply/:commentId', custFbAuth, custReplyComment);
// cleaner create replies
app.post('/cleanerReply/:commentId', cleanerFbAuth, cleanerReplyComment);
// delete comment;
app.delete('/comment/:commentId', custFbAuth, deleteComment);
// delete Customer reply
app.delete('/custReply/:custReplyId', custFbAuth, deleteCustReply);
// delete cleaner reply
app.delete('/cleanerReply/:cleanerReplyId', cleanerFbAuth, deleteCleanerReply);
// Update Comment
app.post('/comment/edit/:commentId', custFbAuth, updateComment);


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
// mark notification read
app.post('/cleanerNotifications', cleanerFbAuth, markNotificationRead);
// get cleaner by location
app.post('/locations', getCleanersByLocation);

// like and unlike route
// like cleaner
app.get('/like/:cleanerName', custFbAuth, likeCleaner);
//  cancellike cleaner
app.get('/cancelLike/:cleanerName', custFbAuth, cancelLikeCleaner);
// unlike cleaner
app.get('/unlike/:cleanerName', custFbAuth, unlikeCleaner);
// cancel Unlike cleaner
app.get('/cancelUnlike/:cleanerName', custFbAuth, cancelUnlikeCleaner);

//History route
app.get('/histories', custFbAuth, getHistories);
app.get('/history/:customerName', cleanerFbAuth, createHistory);

//reserve route
app.get('/reserves', cleanerFbAuth, getReservation);
app.get('/reserve/:cleanerName', custFbAuth, createReservation);
app.delete('/reserve/:reserveId', custFbAuth, deleteReservation);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions
    .firestore.document('likes/{id}')
    .onCreate(snapshot => {
        return db.doc(`/cleaners/${snapshot.data().cleanerName}`)
            .get()
            .then(doc => {
                if (doc.exists && doc.data().userHandle != snapshot.data().userHandle) {
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
            .catch(err => {
                console.error(err);
            });
    });

exports.deleteNotificationOnCancelLike = functions
    .firestore.document('likes/{id}')
    .onDelete(snapshot => {
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
            });
    });


exports.createNotificationOnCustReply = functions
    .firestore.document('custReplies/{id}')
    .onCreate(snapshot => {
        return db.doc(`/comments/${snapshot.data().commentId}`)
            .get()
            .then(doc => {
                if (doc.exists && doc.data().userHandle != snapshot.data().userHandle) {
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
            .catch(err => {
                console.error(err);
            });
    });

exports.createNotificationOnCleanerReply = functions
    .firestore.document('cleanerReplies/{id}')
    .onCreate(snapshot => {
        return db.doc(`/comments/${snapshot.data().commentId}`)
            .get()
            .then(doc => {
                if (doc.exists && doc.data().userHandle != snapshot.data().userHandle) {
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
            .catch(err => {
                console.error(err);
            });
    });

exports.createNotificationOnComment = functions
    .firestore.document('comments/{id}')
    .onCreate(snapshot => {
        return db.doc(`/cleaners/${snapshot.data().commentOn}`)
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
            .catch(err => {
                console.error(err);
            });
    });

exports.createNotificationOnReserve = functions
    .firestore.document('reservations/{id}')
    .onCreate(snapshot => {
        return db.doc(`/cleaners/${snapshot.data().cleanerName}`)
            .get()
            .then(doc => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`)
                        .set({
                            createdAt: new Date().toISOString(),
                            recipient: doc.data().cleanerName,
                            sender: snapshot.data().customerName,
                            type: 'reserve',
                            read: false
                        });
                }
            })
            .catch(err => {
                console.error(err);
            });
    });

exports.removeReservationWhenHistoryCreate = functions
    .firestore.document('hisstories/{id}')
    .onCreate(snapshot => {
        return db.doc(`/reservations/${snapshot.data().customerName}`)
            .delete()
            .catch(err => {
                console.error(err);
            });
    });

exports.createNotificationOnHistory = functions
    .firestore.document('histories/{id}')
    .onCreate(snapshot => {
        return db.doc(`/customers/${snapshot.data().customerName}`)
            .get()
            .then(doc => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`)
                        .set({
                            createdAt: new Date().toISOString(),
                            recipient: doc.data().customerName,
                            sender: snapshot.data().cleanerName,
                            type: 'history',
                            read: false
                        });
                }
            })
            .catch(err => {
                console.error(err);
            });
    });

exports.deleteNotificationOnDeleteComment = functions
    .firestore.document('comments/{id}')
    .onDelete(snapshot => {
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch(err => {
                console.error(err);
            });
    });

exports.onCustImageChange = functions
    .firestore
    .document('/customers/{customerName}')
    .onUpdate(change => {
        if (change.before.data.imageUrl !== change.after.data().imageUrl) {
            const batch = db.batch();
            return db.collection('comments')
                .where('userHandle', '==', change.before.data().customerName)
                .get()
                .then(data => {
                    data.forEach(doc => {
                        const comment = db.doc(`/comments/${doc.id}`)
                        batch.update(comment, { userImage: change.after.data().imageUrl });
                    })
                    return db.collection('custReplies')
                        .where('userHandle', '==', change.before.data().customerName)
                        .get();
                })
                .then(data => {
                    data.forEach(doc => {
                        const reply = db.doc(`/custReplies/${doc.id}`)
                        batch.update(reply, { userImage: change.after.data().imageUrl });
                    });

                    return db.collection('reservations')
                        .where('customerName', '==', change.before.data().customerName)
                        .get();
                })
                .then(data => {
                    data.forEach(doc => {
                        const reply = db.doc(`/reservations/${doc.data().customerName}`)
                        batch.update(reply, { userImage: change.after.data().imageUrl });
                    });

                    return batch.commit();
                });
        } else {
            return true;
        }
    });

exports.onCleanerImageChange = functions
    .firestore
    .document('/cleaners/{cleanerName}')
    .onUpdate(change => {
        if (change.before.data.imageUrl !== change.after.data().imageUrl) {
            const batch = db.batch();
            return db.collection('cleanerReplies')
                .where('userHandle', '==', change.before.data().cleanerName)
                .get()
                .then(data => {
                    data.forEach(doc => {
                        const reply = db.doc(`/cleanerReplies/${doc.id}`)
                        batch.update(reply, { userImage: change.after.data().imageUrl });
                    });

                    return db.collection('histories')
                        .where('customerName', '==', change.before.data().customerName)
                        .get();
                })
                .then(data => {
                    data.forEach(doc => {
                        const reply = db.doc(`/histories/${doc.id}`)
                        batch.update(reply, { userImage: change.after.data().imageUrl });
                    });

                    return batch.commit();
                });
        } else {
            return true;
        }
    });

exports.onCommentDelete = functions
    .firestore.document('/comments/{commentId}')
    .onDelete((snapshot, context) => {
        const commentId = context.params.commentId;
        const batch = db.batch();
        return db.collection('custReplies')
            .where('commentId', '==', commentId)
            .get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/custReplies/${doc.id}`));
                })
                return db.collection('cleanerReplies')
                    .where('commentId', '==', commentId)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/cleanerReplies/${doc.id}`));
                })
                return db.collection('notifications')
                    .where('commentId', '==', commentId)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                })
                return batch.commit();
            })
            .catch(err => console.error(err));
    });

exports.onCleanerDelete = functions
    .firestore.document('/cleaners/{cleanerName}')
    .onDelete((snapshot, context) => {
        const cleanerName = context.params.cleanerName;
        const batch = db.batch();
        return db.collection('likes')
            .where('cleanerName', '==', cleanerName)
            .get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                })
                return db.collection('cleanerReplies')
                    .where('userHandle', '==', cleanerName)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/cleanerReplies/${doc.id}`));
                })
                return db.collection('comments')
                    .where('commentOn', '==', cleanerName)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                })
                return db.collection('notifications')
                    .where('recipient', '==', cleanerName)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                })
                return db.collection('notifications')
                    .where('sender', '==', cleanerName)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                })
                return db.collection('histories')
                    .where('cleanerName', '==', cleanerName)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/histories/${doc.id}`));
                })
                return db.collection('reservations')
                    .where('cleanerName', '==', cleanerName)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/reservations/${doc.id}`));
                })
                return db.collection('unlikes')
                    .where('cleanerName', '==', cleanerName)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/unlikes/${doc.id}`));
                })
                return batch.commit();
            })
            .catch(err => console.error(err));
    });