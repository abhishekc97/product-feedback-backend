const { Router } = require("express");
const route = Router();

const Category = require("../models/Category");

// GET request, returns list of all categories
route.get("/all", async function (req, res, next) {
    try {
        const results = await Category.find({});
        if (!results) {
            res.status(404).send("Could not find any categories");
        } else {
            res.json(results);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = route;
