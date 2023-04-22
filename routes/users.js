const { Router } = require("express");

const generateAuthenticationToken = require("../helper/helper");
const User = require("../models/User");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const route = Router();

// POST request to create a new user
route.post("/register", async function (req, res, next) {
    try {
        // get user details from req body
        const { name, email, mobile, password } = req.body;

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

        // error given if no such user exists
        if (!foundUser) {
            return res.status(404).send("User does not exist.");
        }

        if (foundUser) {
            const passwordsMatch = await bcrypt.compare(
                password,
                foundUser.password
            );

            if (passwordsMatch) {
                const payload = { id: foundUser._id, email: foundUser.email };
                const token = await generateAuthenticationToken(payload);
                return res.status(200).json({ token: token });
            } else if (!passwordsMatch) {
                // possibility of incorrect credentials
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

module.exports = route;
