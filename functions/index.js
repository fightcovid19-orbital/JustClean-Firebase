const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

// get all the cleaners
app.get('/cleaners', (req, res) => {
    admin.firestore().collection('cleaners').get()
        .then(data => {
            let cleaners = [];
            data.forEach(doc => {
                cleaners.push(doc.data());
            });
            return res.json(cleaners);
        })
        .catch(err => console.error(err))
});

// create a new cleaner
app.post('/cleaner', (req, res) => {
    if (req.method !== 'POST') {
        return res.status(400).json({ error: 'Method not allowed' })
    };
    const newCleaner = {
        cleanerHandle: req.body.cleanerHandle,
        createdAt: new Date().toISOString(),
        hiredCount: 0,
        likeCount: 0,
        unlikeCount: 0
    };
    admin.firestore().collection('cleaners').add(newCleaner)
        .then(doc => {
            res.json({ message: ` cleaner ${doc.id} created successfully` })
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
});

// get cleaner's all comment
exports.getComments = functions.https.onRequest((req, res) => {
    admin.firestore()
        .collection('comments')
        .get()
        .then(data => {
            let comments = [];
            data.forEach(doc => {
                comments.push(doc.data());
            });
            return res.json(comments);
        })
        .catch(err => console.err(err));
});


// create comment
exports.createComment = functions.https.onRequest((req, res) => {

    const newComment = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin.firestore()
        .collection('comments')
        .add(newComment)
        .then(doc => {
            res.json({ message: `comment ${doc.id} created successfully` });
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
});

exports.api = functions.https.onRequest(app);