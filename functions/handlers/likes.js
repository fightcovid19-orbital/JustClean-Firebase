const { db } = require('../util/admin');

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
                cleanerData = {
                    likeCount: doc.data().likeCount,
                    hiredCount: doc.data().hiredCount,
                    location: doc.data().location,
                    type: doc.data().type,
                    email: doc.data().email,
                    cleanerId: doc.data().cleanerId,
                    cleanerName: doc.data().cleanerName,
                    unlikeCount: doc.data().unlikeCount,
                    imageUrl: doc.data().imageUrl,
                    createdAt: doc.data().createdAt
                };
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "Cleaner does not exists" });
            }
        })
        .then(likeDoc => {
            if (likeDoc.empty) {
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
                cleanerData = {
                    likeCount: doc.data().likeCount,
                    hiredCount: doc.data().hiredCount,
                    location: doc.data().location,
                    type: doc.data().type,
                    email: doc.data().email,
                    cleanerId: doc.data().cleanerId,
                    cleanerName: doc.data().cleanerName,
                    unlikeCount: doc.data().unlikeCount,
                    imageUrl: doc.data().imageUrl,
                    createdAt: doc.data().createdAt
                };
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
                cleanerData = {
                    likeCount: doc.data().likeCount,
                    hiredCount: doc.data().hiredCount,
                    location: doc.data().location,
                    type: doc.data().type,
                    email: doc.data().email,
                    cleanerId: doc.data().cleanerId,
                    cleanerName: doc.data().cleanerName,
                    unlikeCount: doc.data().unlikeCount,
                    imageUrl: doc.data().imageUrl,
                    createdAt: doc.data().createdAt
                };
                return unlikeDocument.get();
            } else {
                return res.status(404).json({ error: "Cleaner does not exists" });
            }
        })
        .then(unlikeDoc => {
            if (unlikeDoc.empty) {
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
                cleanerData = {
                    likeCount: doc.data().likeCount,
                    hiredCount: doc.data().hiredCount,
                    location: doc.data().location,
                    type: doc.data().type,
                    email: doc.data().email,
                    cleanerId: doc.data().cleanerId,
                    cleanerName: doc.data().cleanerName,
                    unlikeCount: doc.data().unlikeCount,
                    imageUrl: doc.data().imageUrl,
                    createdAt: doc.data().createdAt
                };
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