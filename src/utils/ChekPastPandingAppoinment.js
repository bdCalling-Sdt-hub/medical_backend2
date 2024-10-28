const Appointment = require("../Models/AppointmentModel");

const checkPastPendingAppointments = async () => {
    try {
        const now = new Date();
        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(now.getDate() - 2);
        const appointments = await Appointment.find({
            status: 'pending',
            date: { $lt: now }
        });
        const appointmentsAccepted = await Appointment.find({
            status: 'accepted',
            date: { $lt: twoDaysAgo }
        });
        if (appointments.length > 0) {
            // console.log(`Found ${appointments.length} pending appointments with a past date.`);
            for (let appointment of appointments) {
                await Appointment.updateOne({ _id: appointment._id }, { status: 'rejected' });
                // console.log(`Updated appointment ${appointment._id} status to rejected.`);
            }
        } else {
            // console.log('No pending appointments with a past date found.');
        }
        if (appointmentsAccepted.length > 0) {
            // console.log(`Found ${appointments.length} pending appointments with a past date.`);
            for (let appointment of appointmentsAccepted) {
                await Appointment.updateOne({ _id: appointment._id }, { status: 'completed' });
                // console.log(`Updated appointment ${appointment._id} status to rejected.`);
            }
        } else {
            // console.log('No pending appointments with a past date found.');
        }
    } catch (error) {
        // console.error('Error checking past pending appointments:', error);
    }
};

module.exports = checkPastPendingAppointments;
