const { db } = require('../util/admin');
const firebase = require('firebase');

// Always in this order: 
// 'customerName:cleanerName'
// buildDocKey = (customerName, cleanerName) => [customerName, cleanerName].join(':');

exports.getNewChatFromCleaner = (req, res) => {

    const docKey = [req.user.customerName, req.params.cleanerName].join(':')

    db.doc(`chats/${docKey}`)
        .onSnapshot(doc => {
            return res.json(doc.data())
        })
}

exports.getNewChatFromCust = (req, res) => {
    const docKey = [req.params.customerName, req.user.cleanerName].join(':')

    db.doc(`chats/${docKey}`)
        .onSnapshot(doc => {
            return res.json(doc.data())
        })
}

exports.submitMessageToCleaner = (req, res) => {

    const newMessage = {
        sender: req.user.customerName,
        message: req.body.message,
        timestamp: Date.now()
    };

    const docKey = [req.user.customerName, req.params.cleanerName].join(':')

    db.doc(`chats/${docKey}`)
        .update({
            messages: firebase.firestore.FieldValue.arrayUnion(
                newMessage
            ),
            receiverHasRead: false
        });
}

exports.submitMessageToCust = (req, res) => {

    const newMessage = {
        sender: req.user.cleanerName,
        message: req.body.message,
        timestamp: Date.now()
    };

    const docKey = [req.params.customerName, req.user.cleanerName].join(':')


    db.doc(`chats/${docKey}`)
        .update({
            messages: firebase.firestore.FieldValue.arrayUnion(
                newMessage
            ),
            receiverHasRead: false
        });
}


