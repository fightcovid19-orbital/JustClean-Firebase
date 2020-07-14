const { admin, db } = require('../util/admin');
const firebase = require('firebase');

// Always in this order: 
// 'customerName:cleanerName'
// buildDocKey = (customerName, cleanerName) => [customerName, cleanerName].join(':');

exports.getNewChatFromCleaner = (req, res) => {

    const docKey = [req.user.customerName, req.params.cleanerName].join(':');

    db.doc(`chats/${docKey}`)
        .onSnapshot(doc => {
            return res.json(doc.data())
        });
}

exports.getNewChatFromCust = (req, res) => {
    const docKey = [req.params.customerName, req.user.cleanerName].join(':');

    db.doc(`chats/${docKey}`)
        .onSnapshot(doc => {
            return res.json(doc.data())
        });
}

exports.submitMessageToCleaner = (req, res) => {

    const docKey = [req.user.customerName, req.params.cleanerName].join(':');

    db.doc(`chats/${docKey}`)
        .update({
            messages: admin.firestore.FieldValue.arrayUnion({
                sender: req.user.customerName,
                message: req.body.message,
                timestamp: new Date().toISOString()
            }),
            receiverHasRead: false
        })
        .then(() => {
            res.json({ general: 'message sent' });
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
}

exports.submitMessageToCust = (req, res) => {

    const docKey = [req.params.customerName, req.user.cleanerName].join(':');

    db.doc(`chats/${docKey}`)
        .update({
            messages: admin.firestore.FieldValue.arrayUnion({
                sender: req.user.cleanerName,
                message: req.body.message,
                timestamp: new Date().toISOString()
            }),
            receiverHasRead: false
        })
        .then(() => {
            res.json({ general: 'message sent' });
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });

}

// cleaner cannot start message to customer
exports.createNewChatToCleaner = (req, res) => {

    const docKey = [req.user.customerName, req.params.cleanerName].join(':');
    const newChat = {
        messages: [],
        users: [req.user.customerName, req.params.cleanerName],
        receiverHasRead: false
    };

    db.doc(`chats/${docKey}`)
        .get()
        .then(doc => {
            if(doc.exists) {
                return res.satus(400).json({chat: 'Chat already exists'});
            } 
            
            return db.doc(`chats/${docKey}`)
                .set(newChat);
        })
        .then(() => {
            res.json({ general: 'new chat created!' });
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });

}


