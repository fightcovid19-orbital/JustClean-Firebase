const { db } = require('../util/admin');

exports.getNewChatFromCleaner = (req, res) => {
    db.collection('chats')
        .where('users', 'array-contains', req.user.customerName)
        .where('users', 'array-contains', req.params.cleanerName)
        .onSnapshot(async res => {
            const chat = res.docs.map(_doc => _doc.data());
            return chat; // slightly different from chat tut, because we need only 1-1 chat
        })
}

exports.getNewChatFromCust = (req, res) => {
    db.collection('chats')
        .where('users', 'array-contains', req.user.cleanerName)
        .where('users', 'array-contains', req.params.customerName)
        .onSnapshot(async res => {
            const chat = res.docs.map(_doc => _doc.data());
            return chat;
        })
}

exports.submitMessageToCleaner = (req, res) => {

    const newMessage = {
        sender: req.user.customerName,
        message: req.body.message,
        timestamp: Date.now()
    }

    const docKey = this.buildDocKey(req.user.customerName, req.params.cleanerName)

    db.collection('chats')
        .doc(docKey)
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
    }

    const docKey = this.buildDocKey(req.params.customerName, req.user.cleanerName)

    db.collection('chats')
        .doc(docKey)
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

