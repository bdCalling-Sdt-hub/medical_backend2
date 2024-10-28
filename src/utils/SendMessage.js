// const accountSid = 'AC769bc42c6fe8f9c1545d070adeec8d8e';
// const authToken = 'edea369d8a6132892d1cf0288e2d7f95';
// const client = require('twilio')(accountSid, authToken);
// // Replace this with your Twilio phone number
// // const PHONE_NUMBER = '+17722493163';
// const PHONE_NUMBER = '+447828779548';
// // const PHONE_NUMBER = '+447376289855';
// // VA39abdd19b29ed6cc99c8cd636b242a88 VA39abdd19b29ed6cc99c8cd636b242a88
// // const test = async (num) => {
// //     client.verify.v2.services("VAe2eabb637aba6072e6d4c22d7c1b9012")
// //         .verifications
// //         .create({ to: '+8801566026301', channel: 'sms' })
// //         .then(verification => console.log(verification.sid));

// // }
// const sendMessage = async (message, phoneNumber) => {
//     try {
//         // Send the message
//         const result = await client.messages.create({
//             body: message,
//             from: PHONE_NUMBER,
//             to: phoneNumber
//         });
//         console.log(result)
//         return {
//             invalid: false,
//             message: `Message sent successfully to ${phoneNumber}`
//         };
//     } catch (error) {
//         console.error('Error sending message:', error.message);
//         return {
//             invalid: true,
//             message: `Error sending message: ${error.message}`
//         };
//     }
// };


const twilio = require('twilio');
const { ACCOUNT_NUMBER, AUTH_TOKEN, PHONE_NUMBER } = require('../config/defaults');
const client = twilio(ACCOUNT_NUMBER, AUTH_TOKEN);
const sendMessage = async (message, phoneNumber) => {
    try {
        const result = await client.messages.create({
            body: message,
            from: PHONE_NUMBER,
            to: phoneNumber
        });
        // console.log(result)
        return {
            invalid: false,
            message: `Message sent successfully to ${phoneNumber}`
        };
    } catch (error) {
        // console.log('error',error);
        return {
            invalid: true,
            message: `Error sending message: ${error.message}`
        };
    }
};



const PhoneInfo = (num) => {
    // client.lookups.v1.phoneNumbers(num)
    //     .fetch({ type: ['carrier'] })
    //     .then(number => console.log(number.carrier))
    //     .catch(err => console.error(err));

}
module.exports = sendMessage;
// module.exports = PhoneInfo
// module.exports = test

