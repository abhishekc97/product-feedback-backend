const jwt = require("jsonwebtoken");

/** JWT tokenization method, uses payload parameter to generate token. Returns a JWT token */
function generateAuthenticationToken(payload) {
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: "2h",
    });

    return token;
}

module.exports = generateAuthenticationToken;
