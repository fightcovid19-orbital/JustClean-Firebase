const { admin, db } = require('../util/admin');
const config = require('../util/config');
const { reduceUserDetails } = require('../util/validators');

// get all cleaners
exports.getCleaners = (req, res) => {
    db.collection('cleaners')
        .orderBy('likeCount', 'desc')
        .get()
        .then(data => {
            let cleaners = [];
            data.forEach(doc => {
                cleaners.push({
                    cleanerId: doc.id,
                    cleanerName: doc.data().cleanerName,
                    hiredCount: doc.data().hiredCount,
                    likeCount: doc.data().likeCount,
                    unlikeCount: doc.data().unlikeCount,
                    createdAt: doc.data().createdAt,
                    imageUrl: doc.data().imageUrl,
                    location: doc.data().location
                });
            });
            return res.json(cleaners);
        })
        .catch(err => console.error(err));
};

// get all cleaners by location
exports.getCleanersByLocation = (req, res) => {
    db.collection('cleaners')
        .where('location', '==', req.body.location)
        .orderBy('likeCount', 'desc')
        .get()
        .then(data => {
            let cleaners = [];
            data.forEach(doc => {
                cleaners.push({
                    cleanerId: doc.id,
                    cleanerName: doc.data().cleanerName,
                    hiredCount: doc.data().hiredCount,
                    likeCount: doc.data().likeCount,
                    unlikeCount: doc.data().unlikeCount,
                    createdAt: doc.data().createdAt,
                    imageUrl: doc.data().imageUrl,
                    location: doc.data().location
                });
            });
            return res.json(cleaners);
        })
        .catch(err => console.error(err));
};

// upload image
exports.uploadCleanerImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type' });
        }

        const splitImageFileName = filename.split('.');
        const imageExtension = splitImageFileName[splitImageFileName.length - 1];
        imageFileName = `${Math.round(Math.random() * 1000000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                return db.doc(`/cleaners/${req.user.cleanerName}`).update({ imageUrl });
            })
            .then(() => {
                return res.json({ message: 'Image uploaded successfully' })
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code });
            });

    });

    busboy.end(req.rawBody);
};

// upload details
exports.addCleanerDetails = (req, res) => {
    let cleanerDetails = reduceUserDetails(req.body);

    db.doc(`/cleaners/${req.user.cleanerName}`)
        .update(cleanerDetails)
        .then(() => {
            return res.json({ message: 'added successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Get own details
exports.getAuthenticatedCleaner = (req, res) => {
    let cleanerData = {};
    db.doc(`/cleaners/${req.user.cleanerName}`)
        .get()
        .then(doc => {
            if (doc.exists) {
                cleanerData.credentials = doc.data();
                return db.collection("likes")
                    .where("cleanerName", "==", req.user.cleanerName)
                    .get();
            }
        })
        .then(data => {
            cleanerData.likes = [];
            data.forEach(doc => {
                cleanerData.likes.push(doc.data());
            });
            return db.collection('notifications')
                .where('recipient', '==', req.user.cleanerName)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
        })
        .then(data => {
            cleanerData.notifications = [];
            data.forEach(doc => {
                cleanerData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    type: doc.data().type,
                    read: doc.data().read,
                    notificationId: doc.id
                });
            });
            return res.json(cleanerData);
        })
        .catch(err => {
            console.error(err);
            return status(500).json({ error: err.code });
        });
};

//get one cleaner
exports.getCleanerDetails = (req, res) => {
    let cleanerData = {};
    db.doc(`/cleaners/${req.params.cleanerName}`)
        .get()
        .then(doc => {
            if (doc.exists) {
                cleanerData.user = doc.data();
                return db.collection('comments')
                    .where('commentOn', '==', req.params.cleanerName)
                    .orderBy('createdAt', 'desc')
                    .get();
            }
        })
        .then(data => {
            cleanerData.comments = [];
            data.forEach(doc => {
                cleanerData.comments.push({
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    userHandle: doc.data().userHandle,
                    userImage: doc.data().userImage,
                    replyCount: doc.data.replyCount,
                    commentId: doc.id
                });
            });
            res.json(cleanerData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};