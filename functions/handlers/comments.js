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
        userHandle: req.user.customerName,/////////////
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