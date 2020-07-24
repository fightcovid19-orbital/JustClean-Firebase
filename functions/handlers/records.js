const { db } = require('../util/admin');

exports.createRecord = (req, res) => {
    const newRecord = {
        cleanerName: req.user.cleanerName,
        customerName: req.params.customerName,
    };

    db.doc(`/cleaners/${req.user.cleanerName}`)
        .get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({ error: 'Cleaner does not exist'});
            }
           
            return db.doc(`customers/${req.params.customerName}`)
                .get();
        })
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({ error: 'Customer does not exist'});
            }

            newRecord.customerImage =  doc.data().imageUrl;
            newRecord.customerLocation = doc.data().location;

            return db.doc(`records/${req.user.cleanerName}:${req.params.customerName}`)
                .get();
        })
        .then(doc => {
            if(doc.exists) {
                return res.status(400).json({general: 'Done record'});
            } 
            
            return db.doc(`records/${req.user.cleanerName}:${req.params.customerName}`)
                .set(newRecord);
        })
        .then(() => {
            res.json(newRecord);
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });       
};

exports.deleteRecord = (req, res) => {
    const document = db.doc(`/records/${req.params.recordId}`);
    document.get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({error: 'No such record'});
            }
            
            return document.delete();
        })
        .then(() => {
            res.json({ message: ' Record deleted successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};