const { db } = require('../util/admin');
const firebase = require('firebase');

exports.getNewChatFromCleaner = (req, res) => {
    const docKey = this.buildDocKey(req.user.customerName, req.params.cleanerName);

    db.doc(`chats/${docKey}`)
        .onSnapshot(res => {
            const chat = res.docs.map(doc => doc.data());
            return chat; // slightly different from chat tut, because we need only 1-1 chat
        });
}

exports.getNewChatFromCust = (req, res) => {
    const docKey = this.buildDocKey(req.params.customerName, req.user.cleanerName);

    db.doc(`chats/${docKey}`)
        .onSnapshot(res => {
            const chat = res.docs.map(doc => doc.data());
            return chat;
        });
}

exports.submitMessageToCleaner = (req, res) => {

    const newMessage = {
        sender: req.user.customerName,
        message: req.body.message,
        timestamp: Date.now()
    };

    const docKey = this.buildDocKey(req.user.customerName, req.params.cleanerName);

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

    const docKey = this.buildDocKey(req.params.customerName, req.user.cleanerName);

    db.doc(`chats/${docKey}`)
        .update({
            messages: firebase.firestore.FieldValue.arrayUnion(
                newMessage
            ),
            receiverHasRead: false
        });
}

// Always in this order: 
// 'customerName:cleanerName'
buildDocKey = (customerName, cleanerName) => [customerName, cleanerName].join(':');

