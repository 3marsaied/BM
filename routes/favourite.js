const express = require('express');
const {hashPassword, verifyPassword} = require('../utils/password_hashing');
const {createAccessToken, verifyAccessToken, authenticateToken} = require('../oauth2');
const getRandomIntInclusive = require('../utils/RandomNumber');
const router = express.Router();

const User = require('../models/user');
const Favourite = require('../models/Favourite');
const Payment = require('../models/Payment');

router.get('/favourites', authenticateToken, async (req, res) => {
    try {
        const userId = verifyAccessToken(req.token);
        if (!userId) {
            return res.status(401).json({ detail: "Unauthorized" });
        }

        const favourites = await Favourite.find({ userId: userId });
        return res.status(200).json(favourites);
    } catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500).json({ detail: "Internal Server Error" });
    }
});


router.post('/favourites', authenticateToken, async (req, res) => {
    const { accNum, fullName } = req.body; // Use req.body if these are in the request body

    if (!accNum || !fullName) {
        return res.status(400).json({ detail: "accNum and fullName are required" });
    }

    try {
        const userId = verifyAccessToken(req.token);
        if (!userId) {
            return res.status(401).json({ detail: "Unauthorized" });
        }

        // Check if the favourite already exists
        const existingFavourite = await Favourite.findOne({ userId, accNum, fullName });
        if (existingFavourite) {
            return res.status(403).json({ detail: "Already a favourite" });
        }

        // Create and save new favourite
        const newFavourite = new Favourite({
            userId,
            accNum,
            fullName
        });

        await newFavourite.save();
        return res.status(201).json(newFavourite);

    } catch (error) {
        console.error('Internal Server Error:', error);
        if (!res.headersSent) { // Check if headers are already sent
            return res.status(500).json({ detail: "Internal Server Error" });
        }
    }
});






module.exports = router;
