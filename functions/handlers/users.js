const { db } = require('../util/admin');
const config = require('../util/config');
const { validateSignupData, validateLoginData } = require('../util/validators');

const firebase = require('firebase');
firebase.initializeApp(config);

// signup using unique username
// one email apply one acc
exports.signup = (req, res) => {

    const newUser = {
        email: req.body.email,
        userName: req.body.userName,
        type: req.body.type,
        location: req.body.location,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    };

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) {
        return res.status(400).json(errors);
    }

    const defImage = 'default.png';
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${defImage}?alt=media`;

    let token, userId;

    db.doc(`/${newUser.type}s/${newUser.userName}`)
        .get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ userName: 'this name is already taken' });
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
                        let userCredentials;
                        if (newUser.type === 'cleaner') {
                            userCredentials = {
                                cleanerName: newUser.userName,
                                email: newUser.email,
                                createdAt: new Date().toISOString(),
                                location: newUser.location,
                                hiredCount: 0,
                                likeCount: 0,
                                unlikeCount: 0,
                                cleanerId: userId,
                                type: newUser.type,
                                imageUrl
                            };
                        } else {
                            userCredentials = {
                                customerName: newUser.userName,
                                email: newUser.email,
                                createdAt: new Date().toISOString(),
                                location: newUser.location,
                                customerId: userId,
                                type: newUser.type,
                                imageUrl
                            };
                        }

                        return db.doc(`/${newUser.type}s/${newUser.userName}`).set(userCredentials);
                    })
                    .then(() => {
                        return res.status(201).json({ token });
                    })
                    .catch(err => {
                        console.error(err);
                        if (err.code === "auth/email-already-in-use") {
                            return res.status(400).json({ email: "Email is already is use" });
                        } else if (err.code === "auth/weak-password") {
                            return res.status(400).json({ password: "Password is weak" });
                        } else {
                            return res.status(500).json({ general: "Something went wrong, please try again" });
                        }
                    });
            }
        });
};

// the unique email can only log into its type
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

    db.collection(`${user.type}s`)
        .where('email', '==', user.email)
        .get()
        .then(data => {
            let check = false;
            data.forEach(doc => {
                if (doc.exists) {
                    check = true;
                }
            })

            if (check) {
                return firebase.auth()
                    .signInWithEmailAndPassword(user.email, user.password);
            } else {
                return res.status(404).json({ type: 'Wrong type given/ does not have an account yet' });
            }
        })
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.error(err);
            return res.status(403).json({ general: 'Wrong credential please try again' });
        });
};

exports.deleteCleaner = (req, res) => {
    firebase.auth()
        .delete()
        .then(() => {
            return db.doc(`/cleaners/${req.user.cleanerName}`).delete();
        })
        .then(() => {
            return res.json({ message: 'Delete Successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
    db.doc(`/cleaners/${req.user.cleanerName}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(400).json({ message: 'this account has been deleted/ does not exist' });
            } else {
                return firebase.auth().currentUser
                    .delete()
                    .then(() => {
                        return db.doc(`/cleaners/${req.user.cleanerName}`).delete();
                    })
                    .then(() => {
                        return res.json({ message: 'Delete Successfully' });
                    })
                    .catch(err => {
                        console.error(err);
                        return res.status(500).json({ error: err.code });
                    });
            }
        });
};

exports.markNotificationRead = (req, res) => {
    let batch = db.batch();
    req.body.forEach(notificationId => {
        const notification = db.doc(`notifications/${notificationId}`);
        batch.update(notification, { read: true });
    });
    batch.commit()
        .then(() => {
            return res.json({ messgae: "Notifications mark read" })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
}

exports.markChatNotificationRead = (req, res) => {
    let batch = db.batch();
    req.body.forEach(notificationId => {
        const chatNotification = db.doc(`chatNotifications/${notificationId}`);
        batch.update(chatNotification, { read: true });
    });
    batch.commit()
        .then(() => {
            return res.json({ messgae: "Notifications mark read" })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
}