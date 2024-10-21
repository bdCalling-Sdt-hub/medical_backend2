const { AddFCMToken } = require('../Controller/FCMtokenController')
const verifyToken = require('../middlewares/Token/verifyToken')

const FCMtokenRoutes = require('express').Router()
FCMtokenRoutes.post('/fcm-token', verifyToken, AddFCMToken)
module.exports = FCMtokenRoutes