const userModel = require('../models/users');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN;   
const tokenAlgorithm = process.env.JWT_ALGORITHM;

module.exports.login = function (req, res, next) {
    const accountNo = req.body.accountNo;
    const password = req.body.password;
    console.log('Login attempt for account:', accountNo, password);
    if (!accountNo || !password) {
        return res.status(400).json({ message: 'Account Number and password are required' });
    }

    let userData;

    userModel.retrieveByUserAccount(accountNo)
        .then(function (userAccount) {
            if (!userAccount) {
                return res.status(401).json({ message: 'Invalid Account Number or password' });
            }
            userData = userAccount;
            return bcrypt.compare(password, userAccount.password);
        })
        .then(function (isMatch) {
            if (!isMatch) {
                // Throw an error instead of returning a response
                throw { status: 401, message: 'Wrong password' };
            }

            // Create a payload containing user information and a timestamp
            const payload = {
                accountNo: userData.accountNo, 
                role: userData.role, 
                timestamp: new Date() 
            };

            // Generate a JWT token asynchronously
            return new Promise(function (resolve, reject) {
                jwt.sign(
                    payload, // Data to encode in the token
                    secretKey, // Secret key for signing the token
                    {
                        algorithm: tokenAlgorithm, // Algorithm to use for signing
                        expiresIn: tokenDuration // Token expiration duration
                    },
                    function (err, token) {
                        if (err) reject(err); // Reject the promise if an error occurs
                        else resolve(token); // Resolve the promise with the generated token
                    }
                );
            });
        })
        .then(function (token) {
            // Send a success response with the generated token and user details
            return res.status(200).json({
                message: 'Login successful', 
                token, 
                accountNo: userData.accountNo, 
                role: userData.role 
            });
        })
        .catch(function (error) {
            console.error('Login error:', error);
            // Check if this is our custom error object
            if (error.status && error.message) {
                return res.status(error.status).json({ message: error.message });
            }
            // For other errors, sanitize before sending
            return res.status(500).json({ message: 'An internal server error occurred' });
        });        
}