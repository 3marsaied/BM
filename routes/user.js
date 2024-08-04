const express = require('express');
const {hashPassword} = require('../utils/password_hashing');
const {createAccessToken, verifyAccessToken, authenticateToken} = require('../oauth2');
const getRandomIntInclusive = require('../utils/RandomNumber');
const router = express.Router();

const User = require('../models/user');
const Favourite = require('../models/Favourite');
const Payment = require('../models/Payment');

router.post('/register', async (req, res) => {
    const {firstName, lastName, email, country, dateOfBirth, password} = req.body;
    try{
        const existingUser = await User.findOne({ email: email });
        
        if (existingUser) {
            return res.status(409).json({ detail: "User with the same email already exists" });
        }
        var phoneNumber = getRandomIntInclusive(1000000000, 9999999999);
        var nationalIdNumber = getRandomIntInclusive(10000000000000, 99999999999999);
        var balance = getRandomIntInclusive(1000,999999999999999);
        var accountNumber = getRandomIntInclusive(10000000, 99999999);
        const hashedPassword = await hashPassword(password);
        const newUser =  new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            country: country,
            dateOfBirth: dateOfBirth,
            phoneNumber: phoneNumber,
            nationalIdNumber: nationalIdNumber,
            password: hashedPassword,
            balance: balance,
            accountNumber: accountNumber,
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





module.exports = router;