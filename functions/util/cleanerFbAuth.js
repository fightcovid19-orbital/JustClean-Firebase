const { admin, db } = require('./admin');

module.exports = (req, res, next) => {
    let tokenId;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        tokenId = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found');
        return res.status(403).json({ error: 'Unauthorized'});
    }

    admin
        .auth()
        .verifyIdToken(tokenId)
        .then(decodedToken => {
            req.user = decodedToken;
            return db.collection('cleaners')
                .where('cleanerId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            req.user.cleanerName = data.docs[0].data().cleanerName;
            req.user.imageUrl = data.docs[0].data().imageUrl;
            return next();
        })
        .catch(err => {
            console.error('Error while verifying token', err);
            return res.status(403).json(err);
        });
};