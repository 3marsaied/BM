const express = require('express');
const {hashPassword, verifyPassword} = require('../utils/password_hashing');
const {createAccessToken, verifyAccessToken, authenticateToken} = require('../oauth2');
const getRandomIntInclusive = require('../utils/RandomNumber');
const router = express.Router();

const User = require('../models/user');
const Favourite = require('../models/favourite');
const Payment = require('../models/payment');

router.get('/favourites', authenticateToken, async (req, res) => {
    try {
        const userId = verifyAccessToken(req.token);
        if (!userId) {
            return res.status(401).json({ detail: "Unauthorized" });
        }

        const favourites = await Favourite.find({ userId: userId }).select('-__v');
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
        const  fav = await Favourite.findById(newFavourite._id).select('-__v')
        return res.status(201).json(fav);

    } catch (error) {
        console.error('Internal Server Error:', error);
        if (!res.headersSent) { // Check if headers are already sent
            return res.status(500).json({ detail: "Internal Server Error" });
        }
    }
});


router.delete('/favourites', authenticateToken, async function (req, res) {
    const {accNum} = req.body;
    try{
        const userId = verifyAccessToken(req.token);
        if (!userId) {
            return res.status(401).json({ detail: "Unauthorized" });
        }
        const fav = await Favourite.findOne(accNum);
        if (!fav) {
            return res.status(404).json({ detail: "Favourite not found" });
        }
        if(fav.userId !== userId){
            return res.status(403).json({ detail: "Unauthorized to delete this favourite" });
        }
        await fav.remove();
        res.status(202).send({ detail: "Favourite deleted successfully" });
    } catch (error) {
        console.error('Internal Server Error:', error);
        if (!res.headersSent) { // Check if headers are already sent
            return res.status(500).json({ detail: "Internal Server Error" });
        }
    }
});



module.exports = router;
