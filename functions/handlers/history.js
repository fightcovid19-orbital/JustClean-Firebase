const { db } = require('../util/admin');

exports.getHistories = (req, res) => {
    db.collection('histories')
        .where('customerName' == req.params.customerName)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
        .then(data => {
            const hisList = []
            data.forEach(document => {
                db.doc(`/cleaners/${document.cleanerName}`)
                    .get()
                    .then(doc => {
                        if(doc.exists) {
                            hisList.push({
                                userImage: doc.data().userImage,
                                cleanerName: doc.data().cleanerName,
                                createdAt: document.createdAt,
                                likeCount: doc.data().likeCount,
                                unlikeCount: doc.data().unlikeCount
                            });
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        return res.status(404).json({error: err.code});
                    })
            })
            res.json(hisList);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

exports.createHistory = (req, res) => {
    const newHistory = {
        cleanerName: req.user.cleanerName,
        customerName: req.params.customerName,
        createdAt: new Date().toISOString()
    };

    db.doc(`/customers/${req.params.customerName}`)
        .get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({ error: 'Customer does not exist'});
            }

            return db.collection('histories')
                .add(newHistory);
        })
        .then(doc => {
            const resHistory = newHistory;
            resHistory.historyId = doc.id;
            res.json(resHistory);
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });       
};