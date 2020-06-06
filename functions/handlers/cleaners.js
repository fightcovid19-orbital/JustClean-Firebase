const { db } = require('../util/admin');

exports.getCleaners = (req, res) => {
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
        .catch(err => console.error(err));
};