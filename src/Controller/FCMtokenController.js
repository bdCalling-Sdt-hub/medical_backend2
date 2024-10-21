const FCMtokenModel = require("../Models/FCMtoken")

const AddFCMToken = async (req, res) => {
    try {
        const { userId, token } = req.body
        const fcmToken = new FCMtokenModel({ userId, token })
        await fcmToken.save()
        res.status(200).send({ success: true, message: "FCM token added successfully", data: fcmToken })
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || "Internal server error", ...error })
    }
}
const UpdateFCMToken = async (req, res) => {
    try {
        const { id } = req.params
        const { userId, token } = req.body
        const result = FCMtokenModel.updateOne({ _id: id }, { $set: { userId, token } })
        res.status(200).send({ success: true, message: "FCM token added successfully", data: result })
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || "Internal server error", ...error })
    }
}
const deleteFCMToken = async (req, res) => {
    try {
        const { id } = req.params
        const result = FCMtokenModel.deleteOne({ _id: id })
        res.status(200).send({ success: true, message: "FCM token deleted successfully", data: result })
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || "Internal server error", ...error })
    }
}

module.exports = { AddFCMToken, UpdateFCMToken, deleteFCMToken }