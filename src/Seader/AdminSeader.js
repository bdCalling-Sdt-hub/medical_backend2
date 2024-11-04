const User = require("../Models/UserModel");

const SeadAdmin = async () => {
    try {
        const Admin = User?.findOne({ role: 'ADMIN' })
        if (Admin?._id) {
            return
        }
        const adminUser = new User({
            img: null,
            name: 'rebecca',
            age: null,
            email: 'ileratravelhealth@gmail.com',
            date_of_birth: '1980-01-01',
            location: 'Uk',
            phone: '+447376289855',
            password: 'Londonbridge97@@',
            provider: 'credential',
            gender: 'female',
            block: false,
            role: 'ADMIN',
            access: 2,
            verified: true,
            category: [],
        });
        await adminUser.save();
    } catch (error) {

    }
}
module.exports = SeadAdmin