const { Router } = require("express");
const route = Router();

const Category = require("../models/Category");
const Product = require("../models/Product");

// create a product
route.post("/create", async function (req, res, next) {
    try {
        const {
            name,
            category,
            description,
            logoImageURL,
            comments,
            upvoteCount,
            productURL,
        } = req.body;

        if (!name) {
            res.status(400).send(
                "Bad request, check given parameters, product must have name"
            );
        }
        // Create the categories
        for (const categoryName of category) {
            // find collection for a duplicate, do not use callback
            const foundCategory = await Category.find({ name: categoryName });

            // make new category accordingly
            if (foundCategory.length === 0) {
                const category = await Category.create({
                    name: categoryName.toLowerCase(),
                });
            }
        }
        const newProduct = {
            name: name,
            category: category,
            description: description,
            logoImageURL: logoImageURL,
            comments: comments,
            upvoteCount: upvoteCount,
            productURL: productURL,
        };
        const results = await Product.create(newProduct);

        if (results) {
            res.status(200).send("New product has been added");
        }
    } catch (error) {
        next(error);
    }
});

/* get a list of all products with query parameters to filter by product category
 * query param :category (default value of all must be passed to it)
 */
route.get("/", async function (req, res, next) {
    try {
        const category = req.query.category;
        if (!category) {
            res.status(400).send("Bad request, check given parameters");
            return;
        }
        // When API receives a specific category
        const query = {};
        if (category) {
            query.category = { $in: [new RegExp(`^${category}$`, "i")] };
        }

        // If API does not receive specific category
        if (category === "all") {
            const results = await Product.find({});
            res.json(results);
            return;
        } else {
            const results = await Product.find(query);
            res.json(results);
        }
    } catch (error) {
        next(error);
    }
});

// PUT request to update existing product
route.put("/update/:id", async function (req, res, next) {
    try {
        const productId = req.params.id;
        if (!productId) {
            res.status(400).send("Bad request, check given parameters");
            return;
        }
        const { name, category, description, logoImageURL, productURL } =
            req.body;

        // This API will not modify comments and upvote count intentionally
        const updatedDetails = {
            name: name,
            category: category,
            description: description,
            logoImageURL: logoImageURL,
            productURL: productURL,
        };
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updatedDetails },
            { new: true }
        );
        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
});

// POST reequest to add a new comment
route.post("/comment/:id", async function (req, res, next) {
    try {
        const productId = req.params.id;
        const comment = req.body.comment;

        if (!productId) {
            res.status(400).send("Bad request, check given parameters");
            return;
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $push: { comments: comment } },
            { new: true }
        );
        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
});

route.get("/upvote/:id", async function (req, res, next) {
    try {
        const productId = req.params.id;
        if (!productId) {
            res.status(400).send("Bad request, check given parameters");
            return;
        }
        const upvoteProduct = await Product.findByIdAndUpdate(
            productId,
            { $inc: { upvoteCount: 1 } },
            { new: true }
        );
        res.json(upvoteProduct);
    } catch (error) {
        next(error);
    }
});

module.exports = route;
