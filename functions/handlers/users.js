const { admin, db } = require('../util/admin');
const config = require('../util/config');
const { validateSignupData, validateLoginData } = require('../util/validators');

const firebase = require('firebase');
firebase.initializeApp(config);

exports.signup = (req, res) => {
    
    const newUser = {
        email: req.body.email,
        userName: req.body.userName,
        type: req.body.type,
        password: req.body.password,
        comfirmPassword: req.body.comfirmPassword
    };

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) {
        return res.status(400).json(errors);
    }

    const defImage = 'default.png';
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${defImage}?alt=media`;

    let token, userId;
    if(newUser.type === "cleaner") {
        db.doc(`/cleaners/${newUser.userName}`)
            .get()
            .then(doc => {
                if (doc.exists) {
                    return res.status(400).json({userName: 'this name is already taken'});
                } else {
                    return firebase
                        .auth()
                        .createUserWithEmailAndPassword(newUser.email, newUser.password)
                        .then(data => {
                            userId = data.user.uid;
                            return data.user.getIdToken();
                        })
                        .then(tokenId => {
                            token = tokenId;
                            const cleanerCredentials = {
                                cleanerName: newUser.userName,
                                email: newUser.email,
                                type: newUser.type,
                                createdAt: new Date().toISOString(),
                                hiredCount: 0,
                                likeCount: 0,
                                unlikeCount: 0,
                                cleanerId: userId,
                                imageUrl
                            };
                            return db.doc(`/cleaners/${newUser.userName}`).set(cleanerCredentials);
                        })
                        .then(() => {
                            return res.status(201).json({token});
                        })
                        .catch(err => {
                            if (err.code === "auth/email-already-in-use") {
                                return res.status(400).json({ email: "Email is already is use" });
                            } else {
                                console.error(err);
                                return res.status(500).json({error: err.code});
                            }
                        });
                }
            }); 
    } else if (newUser.type === "customer") {
        db.doc(`/customers/${newUser.userName}`)
            .get()
            .then(doc => {
                if (doc.exists) {
                    return res.status(400).json({userName: 'this name is already taken'});
                } else {
                    return firebase
                        .auth()
                        .createUserWithEmailAndPassword(newUser.email, newUser.password)
                        .then(data => {
                            userId = data.user.uid;
                            return data.user.getIdToken();
                        })
                        .then(tokenId => {
                            token = tokenId;
                            const customerCredentials = {
                                customerName: newUser.userName,
                                email: newUser.email,
                                type: newUser.type,
                                createdAt: new Date().toISOString(),
                                customerId: userId,
                                imageUrl
                            };
                            return db.doc(`/customers/${newUser.userName}`).set(customerCredentials);
                        })
                        .then(() => {
                            return res.status(201).json({token});
                        })
                        .catch(err => {
                            if (err.code === "auth/email-already-in-use") {
                                return res.status(400).json({ email: "Email is already is use" });
                            } else {
                                console.error(err);
                                return res.status(500).json({error: err.code});
                            }
                        });
                }
            }); 
    } 
};

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        type: req.body.type,
        password: req.body.password
    };

    const { valid, errors } = validateLoginData(user);

    if (!valid) {
        return res.status(400).json(errors);
    }

    firebase.auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({token});
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/wrong-password'){
                return res.status(403).json({general: 'Wrong credential please try again'});
            } else {
                return res.status(500).json({error: err.code});
            }
        });
};

exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = ('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({headers: req.headers});

    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, minetype) => {
        if (minetype !== 'image/jpeg' && minetype !== 'image/png') {
            return res.status(400).json({error: 'Wrong file type'});
        }
        
        const splitImageFileName = filename.split('.');
        const imageExtension = splitImageFileName[splitImageFileName.length - 1];
        imageFileName = `${Math.round(Math.random() * 1000000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, minetype };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.minetype
                }
            }
        })
        .then(()=> {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            if (req.user.type === 'cleaner') {
                return db.doc(`/cleaners/${req.user.cleanerName}`).update({imageUrl});
            } else if (req.user.type === 'customer') {
                return db.doc(`/customers/${req.user.customerName}`).update({imageUrl});
            }
        })
        .then(() => {
            return res.json({ message: 'Image uploaded successfully'})
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
        
    });

    busboy.end(req.rawBody);
};