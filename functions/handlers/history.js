const { db } = require('../util/admin');

exports.getHistories = (req, res) => {
    db.collection('histories')
        .where('customerName', '==', req.user.customerName)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
        .then(data => {
            const hisList = [];
            data.forEach(doc => {
                if(doc.exists) {
                    hisList.push({
                        cleanerImage: doc.data().cleanerImage,
                        cleanerName: doc.data().cleanerName,
                        createdAt: doc.data().createdAt,
                        historyId: doc.data().id
                    });
                }
            });
            return res.json(hisList);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
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

            return db.doc(`/cleaners/${req.user.cleanerName}`)
                .get();
        })
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({ error: 'Cleaner does not exist'});
            }
            
            newHistory.cleanerImage = doc.data().imageUrl;

            return doc.ref.update({ hiredCount: doc.data().hiredCount + 1});
        })
        .then(() => {
            return db.collection('histories')
                .add(newHistory);
        })
        .then(doc => {
            newHistory.historyId = doc.id;
            return db.doc(`/histories/${doc.id}`)
                .update({historyId: doc.id});
        })
        .then(() => {
            return db.doc(`/reservations/${req.params.customerName}`)
                .get();
        })
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({error: 'No reservation made'});
            }
            
            return db.doc(`/reservations/${req.params.customerName}`)
                .delete();
        })
        .then(() => {
            res.json(newHistory);
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });       
};