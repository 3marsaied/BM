const express = require('express');
const {hashPassword, verifyPassword} = require('../utils/password_hashing');
const {createAccessToken, verifyAccessToken, authenticateToken} = require('../oauth2');
const getRandomIntInclusive = require('../utils/RandomNumber');
const router = express.Router();

const User = require('../models/user');

const Favourite = require('../models/favourite');
const Payment = require('../models/payment');


router.post('/register', async (req, res) => {
    const {firstName, lastName, email, dateOfBirth, password, phoneNumber, address, nationality, gender} = req.body;
    try{
        const existingUser = await User.findOne({ email: email });
        
        if (existingUser) {
            return res.status(409).json({ detail: "User with the same email already exists" });
        }
        var nationalIdNumber = getRandomIntInclusive(10000000000000, 99999999999999);
        var balance = getRandomIntInclusive(1000,99999999);
        var accountNumber = getRandomIntInclusive(10000000, 99999999);
        const hashedPassword = await hashPassword(password);
        const newUser =  new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            dateOfBirth: dateOfBirth,
            phoneNumber: phoneNumber,
            nationalIdNumber: nationalIdNumber,
            password: hashedPassword,
            balance: balance,
            accountNumber: accountNumber,
            address: address,
            nationality: nationality,
            gender: gender
        });

        await newUser.save();

        const user_id = newUser._id;
        const accessToken = createAccessToken({user_id});

        res.status(201).json({ id: newUser._id, firstName: firstName, lastName: lastName, email: email, phoneNumber: newUser.phoneNumber, address: newUser.address, nationality: newUser.nationality, nationalIdNumber: newUser.nationalIdNumber, gender: newUser.gender, dateOfBirth: newUser.dateOfBirth, balance: newUser.balance, currency: newUser.currency, accountNumber: newUser.accountNumber, accessToken: accessToken});

    }catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ detail: "Internal Server Error" });
    }
})


router.put('/changePassword', authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        // Ensure auth is properly obtained and verified
        const userId = verifyAccessToken(req.token);
        if (!userId) {
            return res.status(401).json({ detail: "Unauthorized" });
        }

        // Find the existing user
        const existingUser = await User.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(404).json({ detail: "User not found" });
        }

        // Verify the current password
        const isMatch = await verifyPassword(oldPassword, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ detail: "Invalid current password" });
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update the user's password
        await User.updateOne(
            { _id: userId },
            { $set: { password: hashedPassword } }
        );

        res.status(200).json({ detail: "Password updated successfully" });
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ detail: "Internal Server Error" });
    }
});


router.get('/profileInfo', authenticateToken, async (req, res) => {
    try {
        // Ensure auth is properly obtained and verified
        const userId = verifyAccessToken(req.token);
        if (!userId) {
            return res.status(401).json({ detail: "Unauthorized" });
        }

        // Find user by ID and exclude password from the result
        const user = await User.findById(userId).select('-password'); // Excludes the password field

        if (!user) {
            return res.status(404).json({ detail: "User not found" });
        }

        // Send user data excluding the password
        res.json(user);
        
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ detail: "Internal Server Error" });
    }
});




module.exports = router;