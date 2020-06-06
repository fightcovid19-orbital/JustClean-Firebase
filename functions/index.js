const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.getCleaners = functions.https.onRequest((req, res) => {
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

exports.createCleaner = functions.https.onRequest((req, res) => {

    if (req.method !== 'POST') {
        return res.status(400).json({ error: 'Method not allowed' })
    };

    const newCleaner = {
        cleanerHandle: req.body.cleanerHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
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

// get cleanner's all comment
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
            res.json({message: `comment ${doc.id} created successfully`});
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });       
});
