const { admin, db } = require('./admin');

module.exports = (req, res, next) => {
    let tokenId;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        tokenId = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found');
        return res.status(403).json({ error: 'Unauthorized' });
    }

    admin
        .auth()
        .verifyIdToken(tokenId)
        .then(decodedToken => {
            req.user = decodedToken;
            return db.collection('customers')
                .where('customerId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            req.user.customerName = data.docs[0].data().customerName;

            return next();
        })
        .catch(err => {
            console.error('Error while verifying token ', err);
            return res.status(403).json(err);
        });
};