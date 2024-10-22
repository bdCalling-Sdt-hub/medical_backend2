const { ACCESS_TOKEN_SECRET } = require("../config/defaults");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const uploadFile = require("../middlewares/FileUpload/FileUpload");
const HashPassword = require("../utils/HashPassword");
const SendEmail = require("../utils/SendMail");
const Verification = require("../Models/VerificationCodeModel");
const User = require("../Models/UserModel");
const FormateErrorMessage = require("../utils/FormateErrorMessage");
const Doctor = require("../Models/DoctorModel");
const UnlinkFiles = require("../middlewares/FileUpload/UnlinkFiles");
const Queries = require("../utils/Queries");
const Category = require("../Models/CategoryModel");
const { generateTimeSlots } = require("../utils/GenarateTime");
const FormateRequiredFieldMessage = require("../utils/FormateRequiredFieldMessage");
const checkMissingDays = require("../utils/AvailableForValidation");
const Appointment = require("../Models/AppointmentModel");
const getAgeFromDate = require("../utils/getAgeFromDate");
const FCMtokenModel = require("../Models/FCMtoken");
const sendMessage = require("../utils/SendMessage");
// Clear Cookie


// signUp
const SignUp = async (req, res) => {
    try {
        const { access, confirm_password, password, ...user } = req.body
        if (confirm_password !== password) {
            return res.status(201).send({ success: false, message: "confirm password doesn't match" });
        }
        const phone = user?.phone
        const [existingUsers, doctor] = await Promise.all([
            User.findOne({ phone: phone, verified: false }),
            Doctor.findOne({ phone: phone })
        ])
        if (doctor) {
            return res.status(403).send({ success: false, message: "there's a doctor with this email  you can't create user with this email" })
        }
        if (existingUsers) {
            const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const code = new Verification({
                phone: existingUsers?.phone,
                code: activationCode
            })
            await code.save();
            const result = await sendMessage(`your verification code is ${code?.code}`, existingUsers?.phone)
            if (result?.invalid) {
                return res.status(400).send({ success: false, message: `${existingUsers?.phone} is not a valid number or missing country code` })
            }
            // SendEmail({
            //     sender: 'Medical',
            //     receiver: existingUsers?.email,
            //     subject: 'Verify Your Email - Medical',
            //     msg: `
            //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            //         <h2 style="color: #2c3e50; text-align: center;">Welcome to Medical, ${existingUsers?.name}!</h2>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            //             Thank you for registering on our website. We're excited to have you as part of our community!
            //         </p>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            //             Now, you can explore everything our platform has to offer and benefit from our services.
            //         </p>

            //         <div style="text-align: center; margin: 30px 0;">
            //             <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            //                 Please verify your email with the code below:
            //             </p>
            //             <p style="font-size: 22px; font-weight: bold; background-color: #ecf0f1; padding: 10px 20px; display: inline-block; border-radius: 5px;">
            //                 ${activationCode}
            //             </p>
            //         </div>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            //             If you have any questions or need help, feel free to reach out to us.
            //         </p>

            //         <footer style="margin-top: 40px; text-align: center;">
            //             <p style="color: #95a5a6; font-size: 14px;">
            //                 Best regards,<br>
            //                 <strong>Medical Team</strong><br>
            //                 <a href="https://medicalwebsite.com" style="color: #3498db; text-decoration: none;">Visit our website</a>
            //             </p>
            //         </footer>
            //     </div>
            //     `,
            // });
            return res.status(200).send({ success: true, data: existingUsers, message: 'user already exist a verification code has been sent to your Phone' });
        }
        let existingAdmin;
        let category;
        if (req.body?.role === "ADMIN") {
            [category, existingAdmin] = await Promise.all([
                Category.find(),
                Queries(User, {}, { role: req.body.role })
            ]);
        }
        else {
            category = await Category.find()
        }
        if (existingAdmin?.data?.length > 0) {
            return res.status(201).send({ success: false, message: "admin already exist" });
        }
        if (!user.category && category) {
            user.category = category?.[0]?.name
        } else if (!user.category && !category) {
            user.category = []
        }
        const newUser = new User({ ...user, password });
        if (newUser?._id) {
            const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const code = new Verification({
                phone: newUser?.phone,
                code: activationCode
            })
            await code.save();
            const result = await sendMessage(`your verification code is ${code?.code}`, newUser?.phone)
            if (result?.invalid) {
                return res.status(400).send({ success: false, message: `${newUser?.phone} is not a valid number or missing country code` })
            }
            const savedUser = await newUser.save();
            //send mail
            // SendEmail({
            //     sender: 'Medical',
            //     receiver: savedUser?.email,
            //     subject: 'Welcome to Medical - Registration Successful!',
            //     msg: `
            //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            //         <h2 style="color: #2c3e50; text-align: center;">Hello, ${savedUser?.name}!</h2>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
            //             Congratulations! You have successfully registered on our platform.
            //         </p>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
            //             We're thrilled to have you on board! Now you can start exploring everything our website has to offer.
            //         </p>

            //         <div style="text-align: center; margin: 30px 0;">
            //             <p style="color: #34495e; font-size: 16px;">
            //                 To verify your email, please use the following code:
            //             </p>
            //             <p style="font-size: 22px; font-weight: bold; background-color: #ecf0f1; padding: 15px 25px; display: inline-block; border-radius: 8px; color: #2c3e50;">
            //                 ${activationCode}
            //             </p>
            //         </div>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
            //             If you have any questions or need further assistance, feel free to reach out to our support team.
            //         </p>

            //         <footer style="margin-top: 40px; text-align: center;">
            //             <p style="color: #95a5a6; font-size: 14px;">
            //                 Best regards,<br>
            //                 <strong>Medical Team</strong><br>
            //                 <a href="https://medicalwebsite.com" style="color: #3498db; text-decoration: none;">Visit our website</a>
            //             </p>
            //         </footer>
            //     </div>
            //     `,
            // });

            return res.status(200).send({
                success: true, data: savedUser, message: 'user created successfully and verification code sent to your email',
            });
        } else {
            res.status(201).send({ success: false, message: 'something went wrong' });
        }
    } catch (error) {
        let duplicateKeys = ''
        if (error?.keyValue) {
            duplicateKeys = FormateErrorMessage(error)
            error.duplicateKeys = duplicateKeys
        }
        let requiredField = []
        if (error?.errors) {
            requiredField = FormateRequiredFieldMessage(error?.errors);
            error.requiredField = requiredField;
        }
        res.status(500).send({ success: false, message: requiredField[0] || duplicateKeys || 'Internal server error', ...error });
    }

}

// login 
const SignIn = async (req, res) => {
    try {
        const { phone, password } = req.body
        const [user, doctor] = await Promise.all([
            User.findOne({ phone: phone }),
            Doctor.findOne({ phone: phone })
        ])
        if (user && user?.block) {
            return res.status(400).send({ success: false, message: "your account has been blocked" });
        }
        if (doctor && doctor?.block) {
            return res.status(400).send({ success: false, message: "your account has been blocked" });
        }
        if (user || doctor) {
            let result
            if (user) {
                result = await bcrypt.compare(password, user?.password);
            } else if (doctor) {
                result = await bcrypt.compare(password, doctor?.password);
            } else {
                return res.status(400).send({ success: false, message: "user doesn't exist" });
            }
            if (result) {
                if ((user && !user?.verified) || (doctor && !doctor?.verified)) {
                    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
                    const code = new Verification({
                        phone: doctor?.phone || user?.phone,
                        code: activationCode
                    })
                    const result = await sendMessage(`your verification code is ${activationCode}`, doctor?.phone || user?.phone)
                    if (result?.invalid) {
                        return res.status(400).send({ success: false, message: `${existingUsers?.phone} is not a valid number or missing country code` })
                    }
                    await code.save();
                    return res.status(201).send({ success: true, data: user || doctor, message: "please verify your Code a verification code sent to your Phone" });
                }
                if (!user && doctor && !doctor?.approved) {
                    return res.status(403).send({ success: false, data: user || doctor, message: "your account is awaiting approval" });
                }
                const userData = {
                    email: user?.email || doctor?.email,
                    phone: user?.phone || doctor?.phone,
                    verified: user?.verified || doctor?.verified,
                    name: user?.name || doctor?.name,
                    role: user?.role || doctor?.role,
                    access: user?.access || doctor?.access,
                    id: user?._id || doctor?._id
                }
                const token = await jwt.sign(userData, ACCESS_TOKEN_SECRET, { expiresIn: 3600000000 });
                res.status(200).send({
                    success: true, message: 'login successfully', data: user || doctor, token

                });
            } else {
                res.status(400).send({ success: false, message: "Wrong password" });
            }
        } else {
            res.status(400).send({ success: false, message: "user doesn't exist" });
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
// login  doctor
const DoctorSignIn = async (req, res) => {
    try {
        const { email, password } = req.body
        //console.log(req.body)
        const user = await Doctor.findOne({ email: email })
        if (user) {
            const result = await bcrypt.compare(password, user?.password);
            if (result) {
                const userData = {
                    email: user?.email,
                    phone: user?.phone,
                    verified: user?.verified,
                    name: user?.name,
                    role: user?.role,
                    access: user?.access,
                    id: user?._id
                }
                const token = await jwt.sign(userData, ACCESS_TOKEN_SECRET, { expiresIn: 3600000000 });
                res.status(200).send({
                    success: true, data: user, token

                });
            } else {
                res.status(400).send({ success: false, error: { message: "Wrong Credentials" } });
            }
        } else {
            res.status(400).send({ success: false, message: "user doesn't exist" });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error, });
    }
}
// delete Account 
const DeleteAccount = async (req, res) => {
    try {
        const { email, password } = req.body
        const [user, doctor] = await Promise.all([
            User.findOne({ email: email }),
            Doctor.findOne({ email: email })
        ])
        console.log(user, doctor, email, password)
        if (user) {
            const result = await bcrypt.compare(password, user?.password);
            if (result) {
                const deleted = await User.deleteOne({ _id: user?._id })
                return res.status(200).send({ success: true, message: "user deleted successfully", data: deleted });
            } else {
                return res.status(400).send({ success: false, message: "user doesn't exist" });
            }
        } else if (doctor) {
            const result = await bcrypt.compare(password, doctor?.password);
            if (result) {
                const deleted = await Doctor.deleteOne({ _id: doctor?._id })
                return res.status(200).send({ success: true, message: "doctor deleted successfully", data: deleted });
            } else {
                return res.status(400).send({ success: false, message: "user doesn't exist" });
            }
        } else {
            return res.status(400).send({ success: false, message: "user doesn't exist" });
        }
        // if (user || doctor) {
        //     let result
        //     if (user) {
        //         result = await bcrypt.compare(password, user?.password);
        //     } else if (doctor) {
        //         result = await bcrypt.compare(password, doctor?.password);
        //     } else {
        //         return res.status(400).send({ success: false, message: "user doesn't exist" });
        //     }
        //     if (result) {

        //     }
        // }
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
//update user
const UpdateUser = async (req, res) => {
    try {
        await uploadFile()(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ success: false, message: err.message });
            }
            const { id } = req?.user;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).send({ success: false, message: 'User not found' });
            }
            try {
                const { access, role, email, password, phone, category, ...data } = req.body;
                const { img } = req.files || {};
                if (err) {
                    return res.status(400).send({ success: false, message: err.message || 'Something went wrong', ...err });
                }
                if (req?.files?.img) {
                    data.img = req.files.img[0]?.path
                }
                if (category) {
                    data.category = JSON.parse(category)
                }
                // console.log({
                //     ...data,
                //     img: img?.[0]?.path || user?.img,
                // })
                const result = await User.updateOne({ _id: id }, {
                    $set: {
                        ...data,
                        img: img?.[0]?.path || user?.img,

                    }
                })
                if (img) {
                    UnlinkFiles([user?.img]);
                }
                res.status(200).send({ success: true, data: result, message: 'Profile Updated Successfully' });
            } catch (error) {
                return res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
    }
}

// change password 
const ChangePassword = async (req, res) => {
    try {
        const { old_Password, password, confirm_password } = req.body;
        if (password !== confirm_password) {
            return res.status(201).send({ success: false, message: "confirm password doesn't match" });
        }
        const { id, role } = req?.user
        //console.log(id, { old_Password, password })
        if (old_Password === password) {
            return res.status(403).send({ success: false, message: "new password cannot be your old password", });
        }
        let user;
        if (role === 'DOCTOR') {
            user = await Doctor.findById(id);
        } else {
            user = await User.findById(id);
        }
        const newPasswordCheck = await bcrypt.compare(password, user?.password);
        if (newPasswordCheck) {
            return res.status(403).send({ success: false, message: "new password cannot be your old password", });
        }
        const CheckPassword = await bcrypt.compare(old_Password, user?.password);
        //console.log(CheckPassword)
        if (CheckPassword) {
            const hash_pass = await HashPassword(password)
            let result;
            if (role === 'DOCTOR') {
                result = await Doctor.updateOne({ _id: id }, {
                    $set: {
                        password: hash_pass
                    }
                })
            } else {
                await User.updateOne({ _id: id }, {
                    $set: {
                        password: hash_pass
                    }
                })
            }
            SendEmail({
                sender: 'Medical',
                receiver: user?.email,
                subject: 'Password Changed Successfully',
                msg: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #2c3e50; text-align: center;">Hello, ${user?.name}</h2>
                    
                    <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                        We wanted to inform you that your password has been successfully changed.
                    </p>
            
                    <div style="margin: 20px 0; text-align: center;">
                        <p style="color: #34495e; font-size: 16px;">
                            Here is your new password:
                        </p>
                        <p style="font-size: 20px; font-weight: bold; background-color: #ecf0f1; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                            ${password}
                        </p>
                    </div>
            
                    <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                        If you didn’t request this change or believe it was a mistake, please contact our support team immediately.
                    </p>
            
                    <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                        Thank you for using our services!
                    </p>
            
                    <footer style="margin-top: 40px; text-align: center;">
                        <p style="color: #95a5a6; font-size: 14px;">
                            Best regards,<br>
                            <strong>Medical Team</strong><br>
                            <a href="https://medicalwebsite.com" style="color: #3498db; text-decoration: none;">Visit our website</a>
                        </p>
                    </footer>
                </div>
                `,
            });

            return res.status(200).send({ success: true, message: 'password updated successfully', data: result });
        } else {
            return res.status(403).send({ success: false, message: "old password doesn't match", });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}

// forget password send verification code
const SendVerifyEmail = async (req, res) => {
    try {
        const { phone } = req.body
        if (!phone) {
            return res.status(400).send({ success: false, message: 'invalid Phone number' });
        }
        let user = {}
        const [doctor, normalUser] = await Promise.all([
            Doctor.findOne({ phone: phone }),
            User.findOne({ phone: phone })
        ])
        if (normalUser || doctor) {
            if (normalUser) {
                user = normalUser
            } else {
                user = doctor
            }
            if (!user?.email) {
                return res.status(400).send({ success: false, message: 'email not found' });
            }
            const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const code = new Verification({
                phone: phone,
                code: activationCode
            })

            const msgResult = await sendMessage(`your verification code is ${code?.code}`, user?.phone)
            if (msgResult?.invalid) {
                return res.status(400).send({ success: false, message: `${existingUsers?.phone} is not a valid number or missing country code` })
            }
            // SendEmail({
            //     sender: 'Medical',
            //     receiver: user?.email,
            //     subject: 'Email Verification Code',
            //     msg: `
            //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            //         <h2 style="color: #2c3e50; text-align: center;">Hello, ${user?.name}!</h2>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
            //             We have received a request to reset your password. Please use the verification code below to proceed:
            //         </p>

            //         <div style="margin: 20px 0; text-align: center;">
            //             <p style="font-size: 22px; font-weight: bold; background-color: #ecf0f1; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            //                 ${activationCode}
            //             </p>
            //         </div>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
            //             If you did not request this code, please contact our support team for assistance.
            //         </p>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
            //             Thank you for choosing Medical!
            //         </p>

            //         <footer style="margin-top: 40px; text-align: center;">
            //             <p style="color: #95a5a6; font-size: 14px;">
            //                 Best regards,<br>
            //                 <strong>Medical Team</strong><br>
            //                 <a href="https://medicalwebsite.com" style="color: #3498db; text-decoration: none;">Visit our website</a>
            //             </p>
            //         </footer>
            //     </div>
            //     `,
            // });

            //console.log(email)
            await code.save()
            return res.status(200).send({ success: true, message: `verification code has been sent to ${user?.phone}`, });
        }
        else {
            return res.status(400).send({ success: false, message: 'email not found' });
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}

//verify code
const VerifyCode = async (req, res) => {
    const { code, phone } = req.body;
    console.log(req.body)
    try {
        const [verify, user, doctor] = await Promise.all([
            Verification.findOne({ phone: phone, code: code }),
            User.findOne({ phone: phone }),
            Doctor.findOne({ phone: phone })
        ])

        if (verify?._id) {
            let type;
            if (user) {
                type = 'USER'
            } else if (doctor) {
                type = 'DOCTOR'
            }
            if (type === 'DOCTOR') {
                await Doctor.updateOne({ phone: phone }, {
                    $set: {
                        verified: true
                    }
                })
            } else {
                await User.updateOne({ phone: phone }, {
                    $set: {
                        verified: true
                    }
                })
            }
            if (doctor && !doctor?.approved) {
                return res.status(200).send({ success: true, message: 'account verified successfully please wait for admin approval' });
            }
            const userData = {
                email: user?.email || doctor?.email,
                phone: user?.phone || doctor?.phone,
                verified: user?.verified || doctor?.verified,
                name: user?.name || doctor?.name,
                role: user?.role || doctor?.role,
                access: user?.access || doctor?.access,
                id: user?._id || doctor?._id
            }
            const token = await jwt.sign(userData, ACCESS_TOKEN_SECRET, { expiresIn: 3600000000 });
            const accessToken = await jwt.sign({ code, phone }, ACCESS_TOKEN_SECRET, { expiresIn: 600 });
            Verification.deleteOne({ phone: phone, code: code })
            res.status(200).send({ success: true, accessToken, token, message: `${type || 'user'} verified successfully` })
        } else {
            res.status(404).send({ success: false, message: "verification code doesn't match" });
        }
    } catch (error) {
        res.status(500).send({ success: false, error: { error, message: error?.message || 'Internal server error', } });
    }
}

//reset password
const ResetPassword = async (req, res) => {
    try {
        const requestedUser = req?.user
        const verify = await Verification.findOne({ phone: requestedUser?.phone, code: requestedUser?.code })
        if (verify?._id) {
            const { password, confirm_password, type } = req.body
            if (password !== confirm_password) {
                return res.status(201).send({ success: false, error: { message: "confirm password doesn't match" } });
            }
            const hash_pass = await HashPassword(password)
            //console.log(hash_pass)
            await Promise.all([
                Doctor.updateOne({ phone: verify?.phone }, {
                    $set: {
                        password: hash_pass
                    }
                }),
                User.updateOne({ phone: verify?.phone }, {
                    $set: {
                        password: hash_pass
                    }
                })
            ])
            // SendEmail({
            //     sender: 'Medical',
            //     receiver: requestedUser?.email,
            //     subject: 'Password Reset Successfully',
            //     msg: `
            //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            //         <h2 style="color: #2c3e50; text-align: center;">Hello, ${requestedUser?.name}!</h2>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
            //             Your password has been successfully reset. You can now log in using your new password.
            //         </p>

            //         <div style="margin: 20px 0; text-align: center;">
            //             <p style="font-size: 22px; font-weight: bold; background-color: #ecf0f1; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            //                 New Password: ${password}
            //             </p>
            //         </div>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
            //             If you didn’t request this password change, please contact our support team immediately for assistance.
            //         </p>

            //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
            //             Thank you for using Medical!
            //         </p>

            //         <footer style="margin-top: 40px; text-align: center;">
            //             <p style="color: #95a5a6; font-size: 14px;">
            //                 Best regards,<br>
            //                 <strong>Medical Team</strong><br>
            //                 <a href="https://medicalwebsite.com" style="color: #3498db; text-decoration: none;">Visit our website</a>
            //             </p>
            //         </footer>
            //     </div>
            //     `,
            // });

            await Verification.deleteOne({ phone: requestedUser?.phone, code: requestedUser?.code })
            return res.status(200).send({ success: true, message: 'password updated successfully' });
        } else {
            res.status(401).send({ success: false, message: "verification code doesn't match" });
        }

    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}

// get user profile
const GetProfile = async (req, res) => {
    const { email, role } = req.user;
    try {
        if (role === 'DOCTOR') {
            const result = await Doctor.findOne({ email: email })
            const total_appointments = await Appointment.countDocuments({ doctorId: result?._id, status: "completed" })
            if (result?._doc?.block === true) {
                return res.status(403).send({ success: false, message: 'you are blocked by admin' });
            }
            const data = {
                ...result?._doc,
                age: getAgeFromDate(result?._doc?.date_of_birth),
                total_appointments: total_appointments || 0
            }
            return res.status(200).send({ success: true, data });
        } else {
            const result = await User.findOne({ email: email })
            if (result?.block === true) {
                return res.status(403).send({ success: false, message: 'you are blocked by admin' });
            }
            return res.status(200).send({ success: true, data: { ...result?._doc, age: getAgeFromDate(result?.date_of_birth), } });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}

// create  doctors
const createDoctor = async (req, res) => {
    try {
        await uploadFile()(req, res, async function (err) {
            if (err) {
                console.error(err);
                return res.status(400).send({ success: false, message: err.message });
            }
            try {
                const { available_days, available_for, services, fcm, ...otherInfo } = req.body
                // console.log(JSON.parse(services))
                const email = otherInfo?.email
                const [existingDoctor, user] = await Promise.all([
                    Doctor.findOne({ email: email, verified: false }),
                    User.findOne({ email: email }),
                ])
                if (user) {
                    return res.status(403).send({ success: false, message: "there's a user with this email  you can't create doctor with this email" })
                }
                if (existingDoctor) {
                    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
                    const code = new Verification({
                        phone: existingDoctor?.phone,
                        code: activationCode
                    })
                    const msgResult = await sendMessage(`your verification code is ${code?.code}`, existingDoctor?.phone)
                    if (msgResult?.invalid) {
                        return res.status(400).send({ success: false, message: `${existingDoctor?.phone} is not a valid number or missing country code` })
                    }
                    await code.save();
                    // SendEmail({
                    //     sender: 'Medical',
                    //     receiver: existingDoctor?.email,
                    //     subject: 'Email Verification Code',
                    //     msg: `
                    //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
                    //         <h2 style="color: #2c3e50; text-align: center;">Hello, Dr. ${existingDoctor?.name}!</h2>

                    //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                    //             You have successfully registered on our platform. We're excited to have you on board!
                    //         </p>

                    //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                    //             To fully access the platform and explore all its features, please verify your email using the code below:
                    //         </p>

                    //         <div style="margin: 30px 0; text-align: center;">
                    //             <p style="font-size: 22px; font-weight: bold; background-color: #ecf0f1; padding: 15px 25px; border-radius: 8px; display: inline-block;">
                    //                 ${activationCode}
                    //             </p>
                    //         </div>

                    //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                    //             If you have any questions or need further assistance, feel free to contact our support team.
                    //         </p>

                    //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                    //             Thank you for choosing Medical!
                    //         </p>

                    //         <footer style="margin-top: 40px; text-align: center;">
                    //             <p style="color: #95a5a6; font-size: 14px;">
                    //                 Best regards,<br>
                    //                 <strong>Medical Team</strong><br>
                    //                 <a href="https://medicalwebsite.com" style="color: #3498db; text-decoration: none;">Visit our website</a>
                    //             </p>
                    //         </footer>
                    //     </div>
                    //     `,
                    // });

                    return res.status(201).send({ success: true, message: 'doctor created successfully a verification code sent to your email', data: existingDoctor, });
                }
                const available_days_purse = JSON.parse(available_days)
                const available_for_purse = JSON.parse(available_for)
                // console.log(available_for_purse, available_days_purse,otherInfo)
                // return res.send({ available_days: JSON.parse(available_days), available_for: JSON.parse(available_for) })
                const { img, license } = req.files || {};
                if (!available_days_purse || Object.keys(available_days_purse).length === 0) {
                    return res.status(400).send({ success: false, message: 'available days are required' });
                }
                let data = {}
                let timeError = {};

                Object.keys(available_days_purse).forEach((key) => {
                    if ((!available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) || (available_days_purse[key]?.startTime && !available_days_purse[key]?.endTime)) {
                        timeError = { message: `missing ${available_days_purse[key]?.startTime ? 'endTime' : 'startTime'} for ${key}` }
                    } else if ((available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) && (available_days_purse[key]?.startTime === available_days_purse[key]?.endTime)) {
                        timeError = { message: `invalid ${available_days_purse[key]?.startTime ? 'endTime' : 'startTime'} for ${key}` }
                    } else if (available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) {
                        try {
                            const timeSlots = generateTimeSlots(available_days_purse[key]?.startTime, available_days_purse[key]?.endTime)
                            data[key] = timeSlots
                        } catch (error) {
                            return res.status(400).send({ success: false, message: error.message })
                        }
                    }
                })
                if (timeError?.message) {
                    return res.status(400).send({ success: false, message: timeError?.message })
                }
                const availableDaysCheck = checkMissingDays(data, available_for_purse)
                if (availableDaysCheck) {
                    return res.status(400).send({ success: false, message: "There are days in 'data' that don't exist in 'availableTime" })
                }
                const doctorData = {
                    ...otherInfo,
                    available_for: available_for_purse,
                    available_days: data,
                    img: img?.[0]?.path || '',
                    license: license?.[0]?.path || ''
                };
                if (services) {
                    const updatedService = JSON.parse(services)
                        ?.filter(item => item.name.trim() !== '' && item.price.trim() !== '') // Filter out empty name and price
                        .reduce((uniqueServices, item) => {
                            if (!uniqueServices.some(service => service.name === item.name)) {
                                uniqueServices.push(item);
                            }
                            return uniqueServices;
                        }, []);
                    // console.log(updatedService, JSON.parse(services))
                    doctorData.services = updatedService
                }
                try {
                    const newDoctor = new Doctor(doctorData);
                    const fcmToken = new FCMtokenModel({ token: fcm, userId: newDoctor?._id })

                    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
                    const code = new Verification({
                        phone: newDoctor?.phone,
                        code: activationCode
                    })
                    const msgResult = await sendMessage(`your verification code is ${code?.code}`, newDoctor?.phone)
                    if (msgResult?.invalid) {
                        return res.status(400).send({ success: false, message: `${newDoctor?.phone} is not a valid number or missing country code` })
                    }
                    await code.save();
                    await Promise.all([newDoctor.save(), fcmToken.save()])
                    // SendEmail({
                    //     sender: 'Medical',
                    //     receiver: newDoctor?.email,
                    //     subject: 'Registration Successful - Email Verification Required',
                    //     msg: `
                    //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
                    //         <h2 style="color: #2c3e50; text-align: center;">Hello, Dr. ${newDoctor?.name}!</h2>

                    //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                    //             Congratulations! You have successfully registered on our platform.
                    //         </p>

                    //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                    //             Now you can explore everything our platform has to offer. To get started, please verify your email using the code below:
                    //         </p>

                    //         <div style="margin: 30px 0; text-align: center;">
                    //             <p style="font-size: 22px; font-weight: bold; background-color: #ecf0f1; padding: 15px 25px; border-radius: 8px; display: inline-block;">
                    //                 ${code?.code}
                    //             </p>
                    //         </div>

                    //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                    //             If you have any questions or need assistance, feel free to contact our support team.
                    //         </p>

                    //         <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                    //             Thank you for joining Medical!
                    //         </p>

                    //         <footer style="margin-top: 40px; text-align: center;">
                    //             <p style="color: #95a5a6; font-size: 14px;">
                    //                 Best regards,<br>
                    //                 <strong>Medical Team</strong><br>
                    //                 <a href="https://medicalwebsite.com" style="color: #3498db; text-decoration: none;">Visit our website</a>
                    //             </p>
                    //         </footer>
                    //     </div>
                    //     `,
                    // });

                    res.status(201).send({ success: true, message: 'doctor created successfully a verification code sent to your email', data: newDoctor });
                } catch (error) {
                    let duplicateKeys = '';
                    if (error?.keyValue) {
                        duplicateKeys = FormateErrorMessage(error);
                        error.duplicateKeys = duplicateKeys;
                    }
                    let requiredField = []
                    if (error?.errors) {
                        requiredField = FormateRequiredFieldMessage(error?.errors);
                        error.requiredField = requiredField;
                    }
                    res.status(500).send({ success: false, message: requiredField[0] || duplicateKeys || 'Internal server error', ...error });
                }
            } catch (error) {
                return res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
    }
};

// update doctor 
const updateDoctor = async (req, res) => {
    const { doctorId } = req.params;

    try {
        if (req.user.role !== 'ADMIN' && req.user.id !== doctorId) {
            return res.status(401).send({ success: false, message: 'unauthorized access' });

        }
        await uploadFile()(req, res, async function (err) {
            if (err) {
                console.log(err)
                return res.status(400).send({ success: false, message: err.message });
            }
            const { phone, role, access, email, password, available_for, services, available_days, ...otherInfo } = req.body;
            const { img, license } = req.files || {};
            let data = {}
            let timeError = {};
            try {
                const doctor = await Doctor.findById(doctorId);
                if (!doctor) {
                    return res.status(404).send({ success: false, message: 'Doctor not found' });
                }
                let available_for_purse;
                let available_days_purse;
                if (available_for) {
                    available_for_purse = JSON.parse(available_for);
                }
                if (available_days) {
                    available_days_purse = JSON.parse(available_days);
                }
                if (available_days_purse && Object.keys(available_days_purse).length === 0) {
                    return res.status(400).send({ success: false, message: 'available days are required' });
                }
                // console.log({ available_days_purse, available_for_purse })
                if (available_days_purse) {
                    Object.keys(available_days_purse).forEach((key) => {
                        if ((!available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) || (available_days_purse[key]?.startTime && !available_days_purse[key]?.endTime)) {
                            timeError = { message: `missing ${available_days_purse[key]?.startTime ? 'endTime' : 'startTime'} for ${key}` }
                        } else if ((available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) && (available_days_purse[key]?.startTime === available_days_purse[key]?.endTime)) {
                            timeError = { message: `invalid ${available_days_purse[key]?.startTime ? 'endTime' : 'startTime'} for ${key}` }
                        } else if (available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) {
                            try {
                                const timeSlots = generateTimeSlots(available_days_purse[key]?.startTime, available_days_purse[key]?.endTime)
                                data[key] = timeSlots
                            } catch (error) {
                                console.log(error)
                                return res.status(400).send({ success: false, message: error.message || 'invalid time' })
                            }
                        }
                    })
                }
                if (timeError?.message) {

                    return res.status(400).send({ success: false, message: timeError?.message })
                }
                console.log(timeError)
                const availableDaysCheck = checkMissingDays(data, available_for_purse || doctor?.available_for)
                if (availableDaysCheck) {
                    return res.status(400).send({ success: false, message: "There are days in 'data' that don't exist in 'availableTime" })
                }
                console.log(availableDaysCheck)
                const filesToDelete = [];
                if (doctor.img) {
                    filesToDelete.push(doctor.img);
                }
                if (doctor.license) {
                    filesToDelete.push(doctor.license);
                }
                if (services) {
                    otherInfo.services = JSON.parse(services)
                }
                // name
                const [result] = await Promise.all([
                    Doctor.updateOne({ _id: doctorId }, {
                        $set: {
                            ...otherInfo,
                            available_for: available_for_purse,
                            available_days: Object.keys(data).length === 0 ? doctor.available_days : data,
                            img: img?.[0]?.path || doctor.img,
                            license: license?.[0]?.path || doctor.license
                        }
                    }),
                    Appointment.updateMany({ doctorId: doctorId }, { name: otherInfo?.name || doctor?.name }),
                ])
                UnlinkFiles(filesToDelete);
                res.status(200).send({ success: true, result, message: 'Doctor updated successfully' });
            } catch (error) {
                let duplicateKeys = '';
                if (error?.keyValue) {
                    duplicateKeys = FormateErrorMessage(error);
                    error.duplicateKeys = duplicateKeys;
                }
                let requiredField = []
                if (error?.errors) {
                    requiredField = FormateRequiredFieldMessage(error?.errors);
                    error.requiredField = requiredField;
                }
                res.status(500).send({ success: false, message: requiredField[0] || duplicateKeys || 'Internal server error', ...error });
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
    }
};

module.exports = {
    SignUp,
    SignIn,
    UpdateUser,
    ChangePassword,
    SendVerifyEmail,
    ResetPassword,
    VerifyCode,
    GetProfile,
    createDoctor,
    updateDoctor,
    DoctorSignIn,
    DeleteAccount
}