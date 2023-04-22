const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const port = process.env.PORT || 3021;
const host = process.env.HOST || "localhost";

const initializeDatabase = require("./config/mongodb.js");
const authentication = require("./middleware/authentication.js");

/** Express App setup */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("common"));
initializeDatabase();

app.listen(port, function (req, res) {
    console.log(`Express server started at http://${host}:${port}`);
});

app.get("/", function (req, res) {
    res.send("App started");
});

app.get("/api/health", function (req, res) {
    res.send(`Backend server is active as of time: ${new Date()}`);
});

/** ROUTES */
const products = require("./routes/products");
app.use("/api/products", products);

const categories = require("./routes/categories");
app.use("/api/categories", categories);

const users = require("./routes/users.js");
app.use("/api/users", users);

/** DO NOT WRITE ANY REGULAR API BELOW THIS */

// error handler middleware
app.use((req, res, next) => {
    const err = new Error("not found");
    err.status = 404;
    next(err);
});

// express error handler, wherever next is passed, this handles those errors
app.use((err, req, res, next) => {
    res.status(err.status || 500); // sets 500 if no error code is set
    res.send({
        error: { status: err.status || 500, message: err.message },
    });
});

/** DO NOT WRITE ANY API BELOW THIS */
