const admin = require('firebase-admin');
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT,
};
const FCMtokenModel = require('../../Models/FCMtoken');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const sendNotification = async (id, title, body) => {
    try {
        const data = await FCMtokenModel.find({ userId: id })
        const message = {
            notification: {
                title: title,
                body: body,
            },
            token: data?.token,
        };
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.log('Error sending message:', error);
    }
};
module.exports = { sendNotification }
