const { model, Schema } = require('mongoose');
const cron = require('node-cron');
const verificationModel = new Schema({
    email: {
        type: String,
        required: false
    },
    code: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 600000
    }
});

const Verification = model('verification', verificationModel);
module.exports = Verification;
cron.schedule('* * * * *', async () => {
    const expirationTime = new Date(Date.now() - 5 * 60 * 1000);
    await Verification.deleteMany({ createdAt: { $lt: expirationTime } });
    console.log('Deleted expired verification codes');
});
