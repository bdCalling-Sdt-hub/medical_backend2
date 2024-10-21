const CallHistory = require("../Models/CallHistoryModel")
const Queries = require("../utils/Queries")

const PostCallHistory = async (req, res) => {
    try {
        const { doctorId, userId, name } = req.body;
        const callHistory = new CallHistory({ doctorId, userId, name })
        await callHistory.save()
        return res.status(200).send({ success: true, data: callHistory })
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message || 'Internal server error' })
    }
}

// get all call history
const GetCallHistory = async (req, res) => {
    try {
        const { id, role } = req.user;
        // console.log(role, id)
        const { search, ...queryKeys } = req.query
        if (role === "DOCTOR") {
            queryKeys.doctorId = id
        } else if (role === "USER") {
            queryKeys.userId = id
        }
        const populatePaths = ["doctorId", "userId"]
        const selectFields = ["name email phone location _id img specialization", "name email phone location _id img age"]
        const searchKey = {}
        if (search) {
            searchKey.name = search
        }
        const result = await Queries(CallHistory, queryKeys, searchKey, populatePath = populatePaths, selectField = selectFields)
        return res.status(200).send({ ...result })
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message || 'Internal server error' })
    }
}
const deleteCallHistory = async (req, res) => {
    try {
        const { id } = req.params
        const result = await CallHistory.findByIdAndDelete(id)
        return res.status(200).send({ success: true, message: "call history deleted successfully", data: result })
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message || 'Internal server error' })
    }
}
module.exports = { PostCallHistory, GetCallHistory,deleteCallHistory }