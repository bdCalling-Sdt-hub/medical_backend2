const { default: mongoose } = require("mongoose");
const Appointment = require("../Models/AppointmentModel");
const PaymentModel = require("../Models/PaymentModel");
const Doctor = require("../Models/DoctorModel");
const User = require("../Models/UserModel");

// get doctor overview 
const GetDoctorOverview = async (req, res) => {
    const { id } = req.user
    try {
        const [result, totalAppointment] = await Promise.all([
            PaymentModel.aggregate([
                {
                    $match: { doctorId: new mongoose.Types.ObjectId(id) }
                },
                {
                    $group: {
                        _id: null,
                        total_received: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$payment_doctor", true] },
                                    then: { $subtract: ["$amount", { $multiply: ["$amount", 0.30] }] },
                                    else: 0
                                }
                            }
                        },
                        available_for_receive: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$payment_doctor", false] },
                                    then: "$amount",
                                    else: 0
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total_received: 1,
                        available_for_receive: 1
                    }
                }
            ]),
            Appointment.aggregate([
                {
                    $match: { doctorId: new mongoose.Types.ObjectId(id) }
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);
        const data = result.length > 0 ? result[0] : { total_received: 0, available_for_receive: 0 };
        const totalAppointmentObj = {
            pending: 0,
            accepted: 0,
            rejected: 0,
            completed: 0
        };
        totalAppointment.forEach(item => {
            totalAppointmentObj[item._id] = item.count;
        });

        data.total_appointment = totalAppointmentObj;
        res.status(200).send({ success: true, data });

    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error })
    }
}
// get Admin Admin Overview
const GetAdminOverview = async (req, res) => {
    try {
        const { role } = req.user
        if (role !== "ADMIN") {
            return res.status(401).send({ success: false, message: "unauthorized access" })
        }
        const [income, total_doctor, total_user, total_appointment] = await Promise.all([
            PaymentModel.aggregate([
                {
                    $group: {
                        _id: null,
                        total_payment: {
                            $sum: "$amount"
                        },
                        total_deduction: {
                            $sum: { $multiply: ["$amount", 0.30] }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total_income: 1,
                        total_deduction: 1
                    }
                }
            ]),
            Doctor.countDocuments({}),
            User.countDocuments({}),
            Appointment.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ])
        ])
        const totalAppointmentObj = {
            pending: 0,
            accepted: 0,
            rejected: 0,
            completed: 0
        };
        total_appointment.forEach(item => {
            totalAppointmentObj[item._id] = item.count;
        });
        const data = income.length > 0 ? income[0] : { total_payment: 0, total_deduction: 0 };
        data.total_doctor = total_doctor;
        data.total_user = total_user;
        data.total_appointment = totalAppointmentObj;
        res.status(200).send({ success: true, data });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error })
    }
}
// get income overview
const GetIncomeOverview = async (req, res) => {
    try {
        const { year } = req.query;
        const { role } = req.user;

        if (role !== "ADMIN") {
            return res.status(401).send({ success: false, message: "unauthorized access" });
        }

        const currentYear = year || new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currentMonth = new Date().getMonth() + 1;
        const currentDate = new Date().getDate();
        // Aggregating data for current year, previous year, and total years
        const [currentYearData, previousYearData, totalYears] = await Promise.all([
            PaymentModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lte: new Date(`${currentYear}-12-31`)
                        }
                    }
                },
                {
                    $project: {
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                        admin_deduction: { $multiply: ["$amount", 0.30] }
                    }
                },
                {
                    $group: {
                        _id: { month: "$month", day: "$day" },
                        total_deduction: { $sum: "$admin_deduction" }
                    }
                }
            ]),
            PaymentModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${previousYear}-01-01`),
                            $lte: new Date(`${previousYear}-12-31`)
                        }
                    }
                },
                {
                    $project: {
                        month: { $month: "$createdAt" },
                        admin_deduction: { $multiply: ["$amount", 0.30] }
                    }
                },
                {
                    $group: {
                        _id: { month: "$month" },
                        total_deduction: { $sum: "$admin_deduction" }
                    }
                }
            ]),
            PaymentModel.aggregate([
                {
                    $group: {
                        _id: { $year: "$createdAt" },
                    }
                },
                {
                    $group: {
                        _id: null,
                        years: { $addToSet: "$_id.year" }
                    }
                }
            ])
        ]);

        // Initialize month names and default monthly data
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const monthlyData = monthNames.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});

        // Fill monthly data for the current year
        currentYearData.forEach(entry => {
            const monthIndex = entry._id.month - 1;
            monthlyData[monthNames[monthIndex]] += entry.total_deduction;
        });

        // Calculate total deductions for yearly comparison
        const totalCurrentYearDeduction = currentYearData.reduce((sum, entry) => sum + entry.total_deduction, 0);
        const totalPreviousYearDeduction = previousYearData.reduce((sum, entry) => sum + entry.total_deduction, 0);

        // Calculate yearly comparison percentage
        const yearlyComparison = totalPreviousYearDeduction > 0
            ? ((totalCurrentYearDeduction - totalPreviousYearDeduction) / totalPreviousYearDeduction) * 100
            : totalCurrentYearDeduction;
        // Calculate monthly comparison percentage
        const currentMonthDeduction = monthlyData[monthNames[currentMonth - 1]] || 0;
        const previousMonthDeduction = monthlyData[monthNames[currentMonth - 2]] || 0;
        const monthlyComparison = previousMonthDeduction > 0
            ? ((currentMonthDeduction - previousMonthDeduction) / previousMonthDeduction) * 100
            : currentMonthDeduction;
        const dailyData = currentYearData.filter(entry => entry._id.month === currentMonth);
        // console.log(dailyData)
        const currentDayDeduction = dailyData.find(entry => entry._id.day === currentDate)?.total_deduction || 0;
        const previousDayDeduction = dailyData.find(entry => entry._id.day === currentDate - 1)?.total_deduction || 0;
        const dailyComparison = previousDayDeduction > 0
            ? ((currentDayDeduction - previousDayDeduction) / previousDayDeduction) * 100
            : currentDayDeduction;

        // Send the response with the data
        res.status(200).send({
            success: true,
            data: {
                monthlyData,
                monthlyComparison,
                dailyComparison,
                yearlyComparison,
                currentYear: year || new Date().getFullYear(),
                total_years: totalYears.length > 0 ? totalYears[0]?.years : [currentYear]
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }

}
// get appointment overview
const GetAppointmentOverview = async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(401).send({ success: false, message: "unauthorized access" })
        }
        const { year } = req.query
        const currentYear = year || new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currentMonth = new Date().getMonth() + 1;
        const currentDate = new Date().getDate();
        const [currentYearData, previousYearData, total_years] = await Promise.all([
            Appointment.aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lte: new Date(`${currentYear}-12-31`)
                        }
                    }
                },
                {
                    $project: {
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" }
                    }
                },
                {
                    $group: {
                        _id: { month: "$month", day: "$day" },
                        total_appointments: { $sum: 1 }
                    }
                }
            ]),
            Appointment.aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(`${previousYear}-01-01`),
                            $lte: new Date(`${previousYear}-12-31`)
                        }
                    }
                },
                {
                    $project: {
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" }
                    }
                },
                {
                    $group: {
                        _id: { month: "$month", day: "$day" },
                        total_appointments: { $sum: 1 }
                    }
                }
            ]),
            Appointment.aggregate([
                {
                    $match: {
                        createdAt: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: { $year: "$createdAt" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        years: { $addToSet: "$_id" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        years: 1
                    }
                }
            ])
        ]);

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const monthlyData = monthNames.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});
        currentYearData.forEach(entry => {
            const monthIndex = entry._id.month - 1;
            monthlyData[monthNames[monthIndex]] = (monthlyData[monthNames[monthIndex]] || 0) + entry.total_appointments;
        });
        let totalCurrentYearAppointments = 0;
        let totalPreviousYearAppointments = 0;

        currentYearData.forEach(entry => {
            totalCurrentYearAppointments += entry.total_appointments;
        });

        previousYearData.forEach(entry => {
            totalPreviousYearAppointments += entry.total_appointments;
        });

        const yearlyComparison = totalPreviousYearAppointments > 0
            ? ((totalCurrentYearAppointments - totalPreviousYearAppointments) / totalPreviousYearAppointments) * 100
            : totalCurrentYearAppointments;
        const currentMonthAppointments = monthlyData[monthNames[currentMonth - 1]];
        const previousMonthAppointments = currentMonth > 1 ? monthlyData[monthNames[currentMonth - 2]] : 0;
        const monthlyComparison = previousMonthAppointments > 0
            ? ((currentMonthAppointments - previousMonthAppointments) / previousMonthAppointments) * 100
            : currentMonthAppointments;
        const dailyData = currentYearData.filter(entry => entry._id.month === currentMonth);
        const currentDayAppointments = dailyData.find(entry => entry._id.day === currentDate)?.total_appointments || 0;
        const previousDayAppointments = dailyData.find(entry => entry._id.day === currentDate - 1)?.total_appointments || 0;
        const dailyComparison = previousDayAppointments > 0
            ? ((currentDayAppointments - previousDayAppointments) / previousDayAppointments) * 100
            : currentDayAppointments;

        res.status(200).send({
            success: true, data: {
                monthlyData,
                monthlyComparison,
                dailyComparison,
                yearlyComparison,
                currentYear: year || new Date().getFullYear(),
                total_years: total_years.length > 0 ? total_years?.[0]?.years : [currentYear]
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error })
    }
}
module.exports = { GetDoctorOverview, GetAdminOverview, GetIncomeOverview, GetAppointmentOverview }