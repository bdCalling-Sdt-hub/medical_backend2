const { GetCallHistory, PostCallHistory, deleteCallHistory } = require('../Controller/CallHistoryController');
const verifyToken = require('../middlewares/Token/verifyToken');

const callHistoryRoutes = require('express').Router();
callHistoryRoutes.get('/get-call-history', verifyToken, GetCallHistory).post('/create-call-history', verifyToken, PostCallHistory).delete('/delete-call-history/:id', verifyToken, deleteCallHistory);
module.exports = callHistoryRoutes