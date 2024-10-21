const { model, Schema } = require('mongoose');

const CallHistorySchema = new Schema({
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'name is required']
    }
}, { timestamps: true })
const CallHistory = model('callHistory', CallHistorySchema);
module.exports = CallHistory