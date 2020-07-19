const { db } = require('../util/admin');
const { commentValidate } = require('../util/validators');

exports.getAllComments = (req, res) => {
    db.collection('comments')
        .where('commentOn', '==', req.params.cleanerName)
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let comments = [];
            data.forEach(doc => {
                comments.push({
                    commentId: doc.id,
                    userHandle: doc.data().userHandle,
                    body: doc.data().body,
                    replyCount: doc.data().replyCount,
                    createdAt: doc.data().createdAt,
                    userImage: doc.data().userImage,
                    commentOn: doc.data().commentOn
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
            newComment.commentId = doc.id;
            return db.doc(`/comments/${doc.id}`)
                .update({commentId: doc.id});
        })
        .then(() => {
            res.json(newComment);
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });       
};

//update comment
exports.updateComment = (req, res) => {
    let newComment = commentValidate(req.body);

    db.doc(`/comments/${req.params.commentId}`)
        .get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({error: 'Comment not found'});
            }
            
            if(doc.data().userHandle !== req.user.customerName) {
                return res.status(403).json({error: 'Unauthenticated'});
            } else {
                return db.doc(`/comments/${req.params.commentId}`)
                    .update(newComment);
            }
        })
        .then(() => {
            return res.json({ message: 'Comment edit successfully'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code});
        });
};

// Delete comment
exports.deleteComment = (req, res) => {
    const document = db.doc(`/comments/${req.params.commentId}`);
    document.get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({error: 'Comment not found'});
            } else if (doc.data().userHandle !== req.user.customerName) {
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