const bcrypt = require('bcrypt');

// Function to hash a password
async function hashPassword(password) {
    try {
        // Generate a salt with a specific number of rounds (e.g., 10)
        const salt = await bcrypt.genSalt(10);
        // Hash the password using the generated salt
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (err) {
        console.error(err);
        throw new Error('Error hashing password');
    }
}

// Function to verify a password
async function verifyPassword(plainPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (err) {
        console.error(err);
        throw new Error('Error verifying password');
    }
}

module.exports = { hashPassword, verifyPassword };
