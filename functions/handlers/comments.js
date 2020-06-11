const { db } = require('../util/admin');

exports.getAllComments = (req, res) => {
    db.collection('comments')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let comments = [];
            data.forEach(doc => {
                comments.push({
                    commentId: doc.id,
                    userHandle: doc.data().userHandle,
                    body: doc.body,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(comments);
        })
        .catch(err => console.err(err));
};

//create comment
exports.createComment = (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({body: 'Must not be empty'});
    }

    const newComment = {
        body: req.body.body,
        userHandle: req.user.customerName,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        commentOn: req.params.cleanerName,
        replyCount: 0
    };

    db.doc(`/cleaners/${req.params.cleanerName}`)
        .get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({ error: 'Cleaner does not exist'});
            }

            return db.collection('comments')
                .add(newComment);
        })
        .then(doc => {
            const resComment = newComment;
            resComment.commentId = doc.id;
            res.json(resComment);
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });       
};

// get one comment
exports.getComment = (req, res) => {
    let commentData = {};
    db.doc(`/comments/${req.params.commentId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({error: 'Comment not Found'})
            }

            commentData = doc.data();
            commentData.commentId = doc.id;
            return db.collection('replies')
                .orderBy('createdAt', 'desc')
                .where('commentId', '==', req.params.commentId)
                .get();
        })
        .then(data => {
            commentData.replies = [];
            data.forEach(doc => {
                commentData.replies.push(doc.data());
            });
            return res.json(commentData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code});
        });
};

// customer reply comment
exports.custReplyComment = (req, res) => {
    if(req.body.body.trim() === '') {
        return res.status(400).json({ reply: 'Must not be empty'});
    }

    const newReply = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        commentId: req.params.commentId,
        userHandle: req.user.customerName,
        userImage: req.user.imageUrl
    };

    db.doc(`/comments/${req.params.commentId}`)
        .get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            return doc.ref.update({ replyCount: doc.data().replyCount + 1});
        })
        .then(() => {
            return db.collection('custReplies')
                .add(newReply);
        })
        .then(() => {
            res.json(newReply);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Something went wrong" });
        });
};

// cleaner reply comment
exports.cleanerReplyComment = (req, res) => {
    if(req.body.body.trim() === '') {
        return res.status(400).json({ reply: 'Must not be empty'});
    }

    const newReply = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        commentId: req.params.commentId,
        userHandle: req.user.cleanerName,
        userImage: req.user.imageUrl
    };

    db.doc(`/comments/${req.params.commentId}`)
        .get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            return doc.ref.update({ replyCount: doc.data().replyCount + 1});
        })
        .then(() => {
            return db.collection('cleanerReplies')
                .add(newReply);
        })
        .then(() => {
            res.json(newReply);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Something went wrong" });
        });
};

// Delete comment
exports.deleteComment = (req, res) => {
    const document = db.doc(`/comments/${req.params.commentId}`);
    document.get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({error: 'Comment not found'});
            }
            if (doc.data().userHandle !== req.user.customerName) {
                return res.status(403).json({ error: 'Unauthorized' });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: ' Comment deleted successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Delete cust Reply
exports.deleteCustReply = (req, res) => {
    const document = db.doc(`/custReplies/${req.params.custReplyId}`);
    document.get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({error: 'Reply not found'});
            }
            if (doc.data().userHandle !== req.user.customerName) {
                return res.status(403).json({ error: 'Unauthorized' });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: ' Reply deleted successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Delete cust Reply
exports.deleteCleanerReply = (req, res) => {
    const document = db.doc(`/cleanerReplies/${req.params.cleanerReplyId}`);
    document.get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({error: 'Reply not found'});
            }
            if (doc.data().userHandle !== req.user.cleanerName) {
                return res.status(403).json({ error: 'Unauthorized' });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Reply deleted successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};