const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { DateTime } = require('luxon');

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;
const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRE_MINUTES = 50000;

// Create an access token
function createAccessToken(data) {
    if (typeof data !== 'object' || data === null) {
        throw new Error('Data must be an object');
    }

    const { user_id } = data; // Check for user_id
    if (user_id === undefined || user_id === null) {
        throw new Error('user_id is missing from the data');
    }

    const toEncode = { ...data };
    const expire = DateTime.utc().plus({ minutes: ACCESS_TOKEN_EXPIRE_MINUTES }).toJSDate();
    toEncode.exp = expire.getTime() / 1000;

    const encodedToken = jwt.sign(toEncode, SECRET_KEY, { algorithm: ALGORITHM });
    return encodedToken;
}




// Verify an access token
function verifyAccessToken(token, credentialsException = null) {

    try {
        const payload = jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
        const userId = payload.user_id;
        if (!userId) {
            if (credentialsException) {
                throw credentialsException;
            } else {
                return false;
            }
        }

        return userId;
    } catch (err) {
        console.error('Error in token verification:', err); // Log any errors
        if (credentialsException) {
            throw credentialsException;
        } else {
            return false;
        }
    }
}


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ detail: "Authorization header missing" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ detail: "Token not provided" });

    // Attach the token to the request for later use
    req.token = token;
    next();
};

module.exports = { createAccessToken, verifyAccessToken, authenticateToken };
