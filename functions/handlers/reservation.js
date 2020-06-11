const { db } = require('../util/admin');

exports.getReservation = (req, res) => {
    db.collection('reservations')
        .where('cleanerName' == req.params.cleanerName)
        .get()
        .then(data => {
            const reserveList = []
            data.forEach(document => {
                db.doc(`/custmers/${document.customerName}`)
                    .get()
                    .then(doc => {
                        if(doc.exists) {
                            reserveList.push({
                                userImage: doc.data().userImage,
                                customerName: doc.data().customerName,
                                createdAt: document.createdAt
                            });
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        return res.status(404).json({error: err.code});
                    })
            })
            res.json(reserveList);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

exports.createReservation = (req, res) => {
    const newReservation = {
        cleanerName: req.params.cleanerName,
        customerName: req.user.customerName,
        createdAt: new Date().toISOString()
    };

    db.doc(`/customers/${req.params.customerName}`)
        .get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({ error: 'Customer does not exist'});
            }

            return db.collection('reservations')
                .add(newReservation);
        })
        .then(doc => {
            const resReservation = newReservation;
            resReservation.reservationId = doc.id;
            res.json(resReservation);
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });       
};