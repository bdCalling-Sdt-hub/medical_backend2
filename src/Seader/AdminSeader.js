const Doctor = require("../Models/DoctorModel");
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
const SeadUser = async () => {
    try {
        const USER = User?.findOne({ role: 'USER' })
        if (USER?._id) {
            return
        }
        const userRole = new User({
            img: null,
            name: 'Rafsan',
            age: null,
            email: 'rafsan@gmail.com',
            date_of_birth: '1980-01-01',
            location: 'Bangladesh',
            phone: '+8801998078387',
            password: '1234567Rr',
            provider: 'credential',
            gender: 'male',
            block: false,
            role: 'USER',
            access: 1,
            verified: true,
            category: [],
        });
        await userRole.save();
    } catch (error) {

    }
}
const SeadDoctor = async () => {
    try {
        const USER = User?.findOne({ role: 'DOCTOR' })
        if (USER?._id) {
            return
        }
        const doctorUser = new Doctor({
            "img": null,
            "name": "Shaharul siyam",
            "email": "siyamoffice0273@gmail.com",
            "date_of_birth": "2002-02-02",
            "location": "bogra bandladesh",
            "phone": "+8801566026301",
            "password": "1234567Rr",
            provider: 'credential',
            gender: 'male',
            block: false,
            role: 'DOCTOR',
            access: 1,
            verified: true,
            services: [
                { name: 'General Consultation', price: 500 },
                { name: 'Specialized Surgery', price: 2000 }
            ],
            "available_days": {
                "monday": [],
                "tuesday": [
                    "9:00 AM",
                    "9:30 AM",
                    "10:00 AM",
                    "10:30 AM",
                    "11:00 AM",
                    "11:30 AM",
                    "12:00 PM",
                    "12:30 PM",
                    "1:00 PM",
                    "1:30 PM",
                    "2:00 PM",
                    "2:30 PM",
                    "3:00 PM",
                    "3:30 PM",
                    "4:00 PM",
                    "4:30 PM"
                ],
                "wednesday": [],
                "thursday": [],
                "friday": [],
                "saturday": [],
                "sunday": []
            },
            "available_for": {
                "monday": "ONLINE",
                "tuesday": "OFFLINE",
                "wednesday": "ONLINE",
                "thursday": "OFFLINE",
                "friday": "ONLINE",
                "saturday": "OFFLINE",
                "sunday": "OFFLINE"
            },
            license: 'MD12345',
            license_no: '456789123',
            specialization: 'cardiology',
            experience: '15 years',
            educational_background: 'MBBS, FCPS in Cardiology',
            current_affiliation: 'City Hospital',
            rating: 4.8,
            total_rated: 250,
            approved: true,
            desc: 'Experienced cardiologist with a dedication to patient care.'
        });

        await doctorUser.save();
    } catch (error) {

    }
}


module.exports = { SeadAdmin, SeadUser, SeadDoctor }