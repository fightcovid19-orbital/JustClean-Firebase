const { admin, db } = require('../util/admin');
const config = require('../util/config');
const { reduceUserDetails } = require('../util/validators');

// get all cleaners
exports.getCleaners = (req, res) => {
    db.collection('cleaners').get()
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
                    imageUrl: doc.data().imageUrl
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
                })
            });
            return res.json(cleanerData);
        })
        .catch(err => {
            console.error(err);
            return status(500).json({ error: err.code });
        })
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
                    .where('userHandle', '==', req.params.commentOn)
                    .orderBy('createdAt', desc)
                    .get()
            }
        })
        .then(data => {
            userData.comments = [];
            data.forEach(doc => {
                userdata.comments.push({
                    body: doc.data().createdAt,
                    userHandle: doc.data().userHandle,
                    userImage: doc.data().userImage,
                    replyCount: doc.data.replyCount,
                    commentId: doc.id
                })
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        })
};

// like cleaner
exports.likeCleaner = (req, res) => {
    const likeDocument = db.collection('likes')
        .where('userHandle', '==', req.user.customerName)
        .where('cleanerName', '==', req.params.cleanerName)
        .limit(1);

    const cleanerDocument = db.doc(`/cleaners/${req.params.cleanerName}`);

    let cleanerData;

    cleanerDocument.get()
        .then(doc => {
            if (doc.exists) {
                cleanerData = doc.data();
                cleanerData.cleanerName = doc.cleanerName;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "Cleaner does not exists" });
            }
        })
        .then(data => {
            if (data.empty) {
                return db.collection('likes')
                    .add({
                        userHandle: req.user.customerName,
                        cleanerName: req.params.cleanerName
                    })
                    .then(() => {
                        cleanerData.likeCount++;
                        return cleanerDocument.update({ likeCount: cleanerData.likeCount });
                    })
                    .then(() => {
                        return res.json(cleanerData);
                    })
            } else {
                return res.status(400).json({ error: "Cleaner already liked" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// cancel like cleaner
exports.cancelLikeCleaner = (req, res) => {
    const likeDocument = db.collection('likes')
        .where('userHandle', '==', req.user.customerName)
        .where('cleanerName', '==', req.params.cleanerName)
        .limit(1);

    const cleanerDocument = db.doc(`/cleaners/${req.params.cleanerName}`);

    let cleanerData;

    cleanerDocument.get()
        .then(doc => {
            if (doc.exists) {
                cleanerData = doc.data();
                cleanerData.cleanerName = doc.cleanerName;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "Cleaner does not exists" });
            }
        })
        .then(data => {
            if (data.empty) {
                return res.status(400).json({ error: "Cleaner not liked" });

            } else {
                return db.doc(`/likes/${data.docs[0].id}`)
                    .delete()
                    .then(() => {
                        cleanerData.likeCount--;
                        return cleanerDocument.update({ likeCount: cleanerData.likeCount });
                    })
                    .then(() => {
                        res.json(cleanerData);
                    })
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// unlike cleaner
exports.unlikeCleaner = (req, res) => {
    const unlikeDocument = db.collection('unlikes')
        .where('userHandle', '==', req.user.customerName)
        .where('cleanerName', '==', req.params.cleanerName)
        .limit(1);

    const cleanerDocument = db.doc(`/cleaners/${req.params.cleanerName}`);

    let cleanerData;

    cleanerDocument.get()
        .then(doc => {
            if (doc.exists) {
                cleanerData = doc.data();
                cleanerData.cleanerName = doc.cleanerName;
                return unlikeDocument.get();
            } else {
                return res.status(404).json({ error: "Cleaner does not exists" });
            }
        })
        .then(data => {
            if (data.empty) {
                return db.collection('unlikes')
                    .add({
                        userHandle: req.user.customerName,
                        cleanerName: req.params.cleanerName
                    })
                    .then(() => {
                        cleanerData.unlikeCount++;
                        return cleanerDocument.update({ unlikeCount: cleanerData.unlikeCount });
                    })
                    .then(() => {
                        return res.json(cleanerData);
                    })
            } else {
                return res.status(400).json({ error: "Cleaner already unliked" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// cancel unlike cleaner
exports.cancelUnlikeCleaner = (req, res) => {
    const unlikeDocument = db.collection('unlikes')
        .where('userHandle', '==', req.user.customerName)
        .where('cleanerName', '==', req.params.cleanerName)
        .limit(1);

    const cleanerDocument = db.doc(`/cleaners/${req.params.cleanerName}`);

    let cleanerData;

    cleanerDocument.get()
        .then(doc => {
            if (doc.exists) {
                cleanerData = doc.data();
                cleanerData.cleanerName = doc.cleanerName;
                return unlikeDocument.get();
            } else {
                return res.status(404).json({ error: "Cleaner does not exists" });
            }
        })
        .then(data => {
            if (data.empty) {
                return res.status(400).json({ error: "Cleaner not unliked" });

            } else {
                return db.doc(`/unlikes/${data.docs[0].id}`)
                    .delete()
                    .then(() => {
                        cleanerData.unlikeCount--;
                        return cleanerDocument.update({ unlikeCount: cleanerData.unlikeCount });
                    })
                    .then(() => {
                        res.json(cleanerData);
                    });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

