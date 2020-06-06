const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const config = {
    apiKey: "AIzaSyDmacItutW55DwYxcLlv6A0nWiR6r4tQik",
    authDomain: "justclean-4db3e.firebaseapp.com",
    databaseURL: "https://justclean-4db3e.firebaseio.com",
    projectId: "justclean-4db3e",
    storageBucket: "justclean-4db3e.appspot.com",
    messagingSenderId: "873878997627",
    appId: "1:873878997627:web:5205a1961829b6ab1a70de",
    measurementId: "G-YC1YWQ7LJW"
};

const firebase = require('firebase');
firebase.initializeApp(config);
const db = admin.firestore();

app.get('/cleaners',(req, res) => {
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
                });
            });
            return res.json(cleaners);
        })
        .catch(err => console.error(err))
});

const isEmpty = string => {
    if(string.trim() === '') {
        return true;
    } else {
        return false;
    }
};

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) {
        return true;
    } else {
        return false;
    }
};

// Signup
app.post('/signup', (req, res) => {
    
    const newCleaner = {
        email: req.body.email,
        cleanerName: req.body.cleanerName,
        password: req.body.password,
        comfirmPassword: req.body.comfirmPassword
    };

    firebase
        .auth()
        .createUserWithEmailAndPassword(newCleaner.email, newCleaner.password)
        .then(data => {
            return res.status(201).json({message: `user ${data.user.uid}`})
        })

    /*// Validation
    let errors = {};
    //email
    if(isEmpty(newCleaner.email)) {
        errors.email = 'Must not be empty';
    } else if(!isEmail) {
        errors.email = 'Must be a valid email address';
    }

    //password
    if (isEmpty(newCleaner.password)) {
        errors.password = "Must not be empty";
    }

    // comfirm password
    if (newCleaner.comfirmPassword !== newCleaner.password) {
        errors.comfirmPassword = "Password not match";
    }

    //Cleaner Name
    if (isEmpty(newCleaner.cleanerName)) {
        errors.cleanerName = "Must not be Empty";
    }

    //check errors exist
    if(Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }

    let token, cleanerId;
    db.doc(`/cleaners/${newCleaner.cleanerName}`)
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
                        return db.doc(`/cleaners/${newCleaner.cleanerName}`).delete(cleanerCredentials);
                    })
                    .then(() => {
                        return res.status(201).json({token});
                    })
                    .catch(err => {
                        console.error(err);
                        return res.status(500).json({error: err.code});
                    });
            }
        });*/  
});

app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    // Validation
    let errors = {};
    //email
    if(isEmpty(newCleaner.email)) {
        errors.email = 'Must not be empty';
    } else if(!isEmail) {
        errors.email = 'Must be a valid email address';
    }

    //password
    if (isEmpty(newCleaner.password)) {
        errors.password = "Must not be empty";
    }

    //check errors exist
    if(Object.keys(errors).length > 0) {
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
})

/*exports.createCleaner = functions.https.onRequest((req, res) => {

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

    db.collection('cleaners').add(newCleaner)
        .then(doc => {
            res.json({ message: ` cleaner ${doc.id} created successfully` })
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
});*/

// get cleanner's all comment
app.get('/comments', (req, res) => {
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
});

const FBAuth = (req, res, next) => {
    let tokenId;
    if (req.headers.authorization && req.headers.authorization.startWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found');
        return res.status(403).json({ error: 'Unauthorized'});
    }

    admin
        .auth()
        .verifyIdToken(tokenId)
        .then(decodedToken => {
            req.user = decodedToken;
            return db.collection('cleaners')///////////////////
                .where('cleanerId',  '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then (data => {
            req.user.cleanerName = data.docs[0].data().cleanerName;
            return next();
        })
        .catch(err => {
            console.error('Error while verifying token', err);
            return res.status(403).json(err);
        })
}

// create comment
app.post('/comment', FBAuth, (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({body: 'Must not be empty'});
    }

    const newComment = {
        body: req.body.body,
        userHandle: req.user.cleanerName,/////////////
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
});

exports.api = functions.https.onRequest(app);
