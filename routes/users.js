const { Router } = require("express");
const route = Router();
const User = require("../models/User");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// POST request to create a new user
route.post("/register", async function (req, res, next) {
    try {
        // get user details from req body
        const { name, email, mobile, password } = req.body;
        console.log(req.body);

        if (!name || !email || !password) {
            return res
                .status(400)
                .send("Bad request, please check given parameters");
        }
        // check db for pre-existing users with same email. if does not exist, create the new user
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res
                .status(409)
                .send("Bad request, this email address has been used");
        }
        // prepare password hash
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // create the new user object and save in db
        const newUser = {
            name: name,
            email: email,
            mobile: mobile,
            password: hashedPassword,
        };

        if (!existingUser) {
            const results = await User.create(newUser);
            if (results) {
                // set the payload to use for generating token
                const payload = { id: results._id, email: results.email };
                const token = await generateAuthenticationToken(payload);
                // return the token in response
                return res.status(200).json({ token: token });
                // return res.status(200).send("New user created");
            }
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

/* POST request, expects parameters email and password.
 * Returns a JWT token after successfull authorization
 */
route.post("/login", async function (req, res, next) {
    try {
        // get user details from req body
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .send("Bad request, please check given parameters");
        }

        // check db for existing users with same email
        const foundUser = await User.findOne({ email: email });
        console.log(foundUser);

        // error given if no such user exists
        if (!foundUser) {
            console.log(foundUser);
            return res.status(404).send("User does not exist.");
        }

        if (foundUser) {
            const passwordsMatch = await bcrypt.compare(
                password,
                foundUser.password
            );
            console.log("passwordsMatch", passwordsMatch);

            if (passwordsMatch) {
                const payload = { id: foundUser._id, email: foundUser.email };
                const token = await generateAuthenticationToken(payload);
                console.log("matched");
                return res.status(200).json({ token: token });
            } else if (!passwordsMatch) {
                // possibility of incorrect credentials
                console.log("didnt match");
                return res
                    .status(400)
                    .send(
                        "Invalid credentials, please check username/password"
                    );
            }
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

/** JWT tokenization method, uses payload parameter to generate token. Returns a JWT token */
async function generateAuthenticationToken(payload) {
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: "2h",
    });

    return token;
}

module.exports = route;
