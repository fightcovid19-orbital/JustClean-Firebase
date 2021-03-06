const { db } = require('../util/admin');

exports.getReservation = (req, res) => {
    db.collection('reservations')
        .where('cleanerName', '==', req.user.cleanerName)
        .get()
        .then(data => {
            const reserveList = [];
            data.forEach(doc => {
                if (doc.exists) {
                    reserveList.push({
                        customerImage: doc.data().customerImage,
                        customerName: doc.data().customerName,
                        createdAt: doc.data().createdAt,
                        customerLocation: doc.data().customerLocation
                    });
                }
            });
            return res.json(reserveList);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// each customer reserves one cleaner 
exports.createReservation = (req, res) => {
    const newReservation = {
        cleanerName: req.params.cleanerName,
        customerName: req.user.customerName,
        createdAt: new Date().toISOString()
    };

    db.doc(`/cleaners/${req.params.cleanerName}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Cleaner does not exist' });
            }

            return db.doc(`customers/${req.user.customerName}`)
                .get();
        })
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Customer does not exist' });
            }

            newReservation.customerImage = doc.data().imageUrl;
            newReservation.customerLocation = doc.data().location;

            return db.doc(`reservations/${req.user.customerName}`)
                .get();
        })
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ general: 'revervation made with other cleaner' });
            }

            return db.doc(`reservations/${req.user.customerName}`)
                .set(newReservation);
        })
        .then(() => {
            res.json(newReservation);
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
};

exports.deleteReservation = (req, res) => {
    const document = db.doc(`/reservations/${req.params.reserveId}`);
    document.get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'No reservation made' });
            }

            return document.delete();
        })
        .then(() => {
            res.json({ message: ' Reservation deleted successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};