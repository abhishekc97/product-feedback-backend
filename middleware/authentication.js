const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        // get the token
        const token =
            req.body.token || req.query.token || req.headers["x-access-token"];

        if (!token) {
            return res
                .status(403)
                .send(
                    "A token is required for authentication, please attach one"
                );
        }

        // decode the token using verify method
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (decoded) {
            // auth middleware passed, go to the next function/process
            next();
        } else {
            return res.status(401).send("Invalid Token");
        }
    } catch (err) {
        console.log(err);
        return res.status(401).send("Invalid Token");
    }
};

module.exports = verifyToken;
