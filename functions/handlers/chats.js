const { db } = require('../util/admin');

// Always in this order: 
// 'customerName:cleanerName'
// buildDocKey = (customerName, cleanerName) => [customerName, cleanerName].join(':');

exports.getNewChatFromCleaner = (req, res) => {

    const docKey = [req.user.customerName, req.params.cleanerName].join(':')

    db.doc(`chats/${docKey}`)
        .get()
        .then(doc => {
            return res.json(doc.data())
        })
        .catch(err => console.error(err));

}

exports.getNewChatFromCust = (req, res) => {
    const docKey = [req.params.customerName, req.user.cleanerName].join(':')

    db.doc(`chats/${docKey}`)
        .get()
        .then(doc => {
            return res.json(doc.data())
        })
        .catch(err => console.error(err));
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


