const express = require('express');
const {hashPassword, verifyPassword} = require('../utils/password_hashing');
const {createAccessToken, verifyAccessToken, authenticateToken} = require('../oauth2');
const getRandomIntInclusive = require('../utils/RandomNumber');
const {convertCurrency} = require('../utils/exchange');
const router = express.Router();

const User = require('../models/user');

const Favourite = require('../models/favourite');
const Payment = require('../models/payment');

router.get('/paymentHistory', authenticateToken, async (req, res) => {
    try {
        const userId = verifyAccessToken(req.token);
        if (!userId) {
            return res.status(401).json({ detail: "Unauthorized" });
        }
        const payments = await Payment.find({ userId }).select('-__v');
        if (! payments) {
            return res.status(404).json({ detail: "No payments found" });
        }
        res.json(payments);
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ detail: "Internal Server Error" });
    }
});


module.exports = router