const { db } = require('../util/admin');
const config = require('../util/config');
const { validateSignupData, validateLoginData } = require('../util/validators')

const firebase = require('firebase');
firebase.initializeApp(config);

exports.signup = (req, res) => {
    
    const newCleaner = {
        email: req.body.email,
        cleanerName: req.body.cleanerName,
        password: req.body.password,
        comfirmPassword: req.body.comfirmPassword
    };

    const { valid, errors } = validateSignupData(newCleaner);

    if (!valid) {
        return res.status(400).json(errors);
    }

    let token, cleanerId;
    db.doc(`/cleaners/${newCleaner.cleanerName}`)
        .get()
        .then(doc => {
            if (doc.exist) {
                return res.status(400).json({cleanerName: 'this name is already taken'});
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newCleaner.email, newCleaner.password)
                    .then(data => {
                        cleanerId = data.user.uid;
                        return data.user.getIdToken();
                    })
                    .then(tokenId => {
                        token = tokenId;
                        const cleanerCredentials = {
                            cleanerName: newCleaner.cleanerName,
                            email: newCleaner.email,
                            createdAt: new Date().toISOString(),
                            hiredCount: 0,
                            likeCount: 0,
                            unlikeCount: 0,
                            cleanerId
                        };
                        return db.doc(`/cleaners/${newCleaner.cleanerName}`).set(cleanerCredentials);
                    })
                    .then(() => {
                        return res.status(201).json({token});
                    })
                    .catch(err => {
                        console.error(err);
                        return res.status(500).json({error: err.code});
                    });
            }
        }); 
};

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const { valid, errors } = validateLoginData(newCleaner);

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