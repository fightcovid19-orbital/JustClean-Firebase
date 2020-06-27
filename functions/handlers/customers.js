const { admin, db } = require('../util/admin');
const config = require('../util/config');
const { reduceUserDetails } = require('../util/validators');

// upload image
exports.uploadCustImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({headers: req.headers});

    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({error: 'Wrong file type'});
        }
        
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
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
            .then(()=> {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                return db.doc(`/customers/${req.user.customerName}`).update({imageUrl});
            })
            .then(() => {
                return res.json({ message: 'Image uploaded successfully'})
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code });
            });
        
    });

    busboy.end(req.rawBody);
};

//upload details
exports.addCustDetails = (req, res) => {
    let custDetails = reduceUserDetails(req.body);

    db.doc(`/customers/${req.user.customerName}`)
        .update(custDetails)
        .then(() => {
            return res.json({ message: 'added successfully'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code});
        });
};

// Get own details
exports.getAuthenticatedCust = (req, res) => {
    let custData = {};
    db.doc(`/customers/${req.user.customerName}`)
        .get()
        .then(doc => {
            if (doc.exists) {
                custData.credentials = doc.data();
                return db.collection("likes")
                    .where("userHandle", "==", req.user.customerName)
                    .get();
            }
        })
        .then(data => {
            custData.likes = [];
            data.forEach(doc => {
                custData.likes.push(doc.data());
            });
            
            return db.collection("unlikes")
                    .where("userHandle", "==", req.user.customerName)
                    .get();
        })
        .then( data => {
            custData.unlikes = [];
            data.forEach(doc => {
                custData.unlikes.push(doc.data());
            });

            return db.collection('notifications')
                .where('recipient', '==', req.user.customerName)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
        })
        .then(data => {
            custData.notifications =[];
            data.forEach(doc => {
                custData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    type: doc.data().type,
                    read: doc.data().read,
                    notificationId: doc.id
                })
            });
            return res.json(custData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code});
        });
};