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

exports.createComment = (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({body: 'Must not be empty'});
    }

    const newComment = {
        body: req.body.body,
        userHandle: req.user.customerName,
        createdAt: new Date().toISOString()
    };

    db.collection('comments')
        .add(newComment)
        .then(doc => {
            res.json({message: `comment ${doc.id} created successfully`});
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
        })
};

// delete comment

// customer reply comment
exports.custReplyComment = (req, res) => {
    if(req.body.body.trim() === '') {
        return res.status(400).json({error: 'Must not be empty'});
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

            return db.collection('replies')
                .add(newReply);
        })
        .then(() => {
            res.json(newReply);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Something went wrong" });
        })
};

// cleaner reply comment
exports.cleanerReplyComment = (req, res) => {
    if(req.body.body.trim() === '') {
        return res.status(400).json({error: 'Must not be empty'});
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

            return db.collection('replies')
                .add(newReply);
        })
        .then(() => {
            res.json(newReply);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Something went wrong" });
        })
};