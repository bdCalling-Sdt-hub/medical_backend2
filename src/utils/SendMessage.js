


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



// const PhoneInfo = (num) => {
//     // client.lookups.v1.phoneNumbers(num)
//     //     .fetch({ type: ['carrier'] })
//     //     .then(number => console.log(number.carrier))
//     //     .catch(err => console.error(err));

// }
module.exports = sendMessage;


