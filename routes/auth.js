const express = require('express');
const { verifyPassword } = require('../utils/password_hashing');
const { createAccessToken, verifyAccessToken, authenticateToken } = require('../oauth2');
const User = require('../models/user');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check for User or Doctor where username or email matches
        const existingUser = await User.findOne({email});
        
        if (existingUser) {
            const isMatchUser = await verifyPassword(password, existingUser.password);
            if (isMatchUser) {
                const user_id = existingUser._id;
                const token = createAccessToken({user_id});
                return res.json({ token, firstName: existingUser.firstName, lastName: existingUser.lastName });
            }
            else{
                res.status(401).json({ message: "Invalid credentials" });
            }
        }

        res.status(401).json({ message: "Invalid credentials" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: "Internal server error" });
    }
});


module.exports = router;
