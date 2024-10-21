const { model, Schema } = require('mongoose');
const FCMtokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor Id is required']
    },
    token: {
        type: String,
        required: [true, 'Token is required']
    }
}, { timestamps: true });
const FCMtokenModel = model('fcmToken', FCMtokenSchema);
module.exports = FCMtokenModel