const { model, Schema } = require('mongoose');

const ServicesSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
    },
    price: {
        type: Number,
        required: [true, 'Service price is required'],
    },
}, { _id: false });

const AppointmentSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor Id is required']
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User Id is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    time: {
        type: String,
        required: [true,]
    },
    day: {
        type: String,
        enum: ['sunday', 'saturday', 'friday', 'thursday', 'wednesday', 'tuesday', 'monday'],
        required: [true, 'Day is required']
    },
    status: {
        type: String,
        required: [true, 'Status Id is required'],
        default: 'pending',
        enum: ['pending', 'accepted', 'rejected', 'completed']
    },
    reason: {
        type: String,
        required: [true, 'Reason is required']
    },
    appointment_type: {
        type: String,
        required: [true, 'Appointment Type is required'],
        enum: ['ONLINE', 'OFFLINE']
    },
    desc: {
        type: String,
        required: [true, 'Description is required']
    },
    prescription: {
        type: [String],
        default: []
    },
    review: {
        type: Boolean,
        required: [true, 'Review is required'],
        enum: [true, false],
        default: false,
    },
    notes: {
        type: String
    },
    reSchedule: {
        type: Boolean,
        default: false
    },
    reSchedule_by: {
        type: String,
        enum: ['DOCTOR', 'USER'],
    },
    payment_status: {
        type: Boolean,
        default: false
    },
    doctor_payment: {
        type: Boolean,
        required: [true, 'Doctor Payment is required'],
        default: false
    },
    additionalFee: {
        type: Number,
        required: [true, 'additional fee is required'],
        default: 0
    },
    // additionalTreatmentList: {
    //     type: [String],
    //     required: [true, 'additional treatment list is required'],
    //     default: []
    // },
    services: {
        type: [ServicesSchema],
        required: [true, 'Service is required'],
        validate: {
            validator: function (value) {
                let hasAvailableDay = true;
                Object.keys(value).forEach(key => {
                    if (value[key] && value[key].length > 0) {
                        hasAvailableDay = false;
                    }
                })
                return hasAvailableDay;
            },
            message: 'At least one Service is required'
        }
    }
}, { timestamps: true });

const Appointment = model('appointment', AppointmentSchema);
module.exports = Appointment