const express = require('express');
const {hashPassword, verifyPassword} = require('../utils/password_hashing');
const {createAccessToken, verifyAccessToken, authenticateToken} = require('../oauth2');
const getRandomIntInclusive = require('../utils/RandomNumber');
const {convertCurrency} = require('../utils/exchange');
const router = express.Router();

const User = require('../models/user');

const Favourite = require('../models/favourite');
const Payment = require('../models/payment');


router.post('/register', async (req, res) => {
    const {firstName, lastName, email, dateOfBirth, password, phoneNumber, address, nationality, gender, nationalIdNumber} = req.body;
    try{
        const existingUser = await User.findOne({ email: email });
        
        if (existingUser) {
            return res.status(409).json({ detail: "User with the same email already exists" });
        }
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

        res.status(201).json({ id: newUser._id, firstName: firstName, lastName: lastName, email: email, phoneNumber: newUser.phoneNumber, address: newUser.address, nationality: newUser.nationality, nationalIdNumber: newUser.nationalIdNumber, gender: newUser.gender, dateOfBirth: newUser.dateOfBirth, balance: newUser.balance, currency: newUser.currency, accountNumber: newUser.accountNumber, token: accessToken});

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
        const userInfo = {
            ...user.toObject(),
            accNum: user.accountNumber  // Add the new field
        };
        delete userInfo.accountNumber;  // Remove the original accountNumber field

        // Send the modified user data
        res.json(userInfo);
        
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ detail: "Internal Server Error" });
    }
});

router.post('/transferMoney', authenticateToken, async (req, res) => {
    const { amountToSend, amountToRecieve, currencyToSend, currencyToRecieve, fromName, toName, fromAccNum, toAccNum, fees } = req.body;

    try {
        const userId = verifyAccessToken(req.token);
        if (!userId) {
            return res.status(401).json({ detail: "Unauthorized" });
        }

        const user = await User.findById(userId);
        if (user.accountNumber !== fromAccNum) {
            return res.status(403).json({ detail: "You are not authorized to transfer from this account" });
        }

        const convertedAmountToTransfer = await convertCurrency(currencyToSend, "USD", parseFloat(amountToSend) + parseFloat(fees));
        if (convertedAmountToTransfer >= user.balance) {
            return res.status(400).json({ detail: "Your balance is less than that amount" });
        }

        const newSenderBalance = user.balance - convertedAmountToTransfer;
        const convertedAmountToRecieve = await convertCurrency(currencyToSend, "USD", parseFloat(amountToSend));

        const recvedAccount = await User.findOne({ accountNumber: toAccNum });
        if (!recvedAccount) {
            return res.status(404).json({ detail: "Recipient account not found" });
        }

        const newReciverBalance = recvedAccount.balance + convertedAmountToRecieve;

        await User.updateOne(
            { accountNumber: toAccNum },
            { $set: { balance: newReciverBalance } }
        );

        await User.updateOne(
            { _id: userId },
            { $set: { balance: newSenderBalance } }
        );

        const newPayment = new Payment({
            recipientName: toName,
            recipientAccNum: toAccNum,
            totalSent: convertedAmountToRecieve,
            userId: userId
        });
        await newPayment.save();

        res.status(200).send({ message: "Money sent successfully" });
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ detail: "Internal Server Error" });
    }
});

router.put('/updateProfileInfo', authenticateToken, async (req, res) => {
    const { firstName, lastName, phone, email } = req.body;

    try {
        // Verify user token
        const userId = verifyAccessToken(req.token);
        if (!userId) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ detail: "Unauthorized" });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ detail: "User not found" });
        }

        // Prepare update data
        const updateData = {
            firstName: firstName === "" ? user.firstName : firstName,
            lastName: lastName === "" ? user.lastName : lastName,
            phoneNumber: phone === "" ? user.phoneNumber : phone,
            email: email === "" ? user.email : email
        };

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true } // Return the updated document
        ).select('-password');

        console.log('User updated successfully:', updatedUser);
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ detail: "Internal Server Error" });
    }
});

    module.exports = router;