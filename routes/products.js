const { Router } = require("express");
const route = Router();

const Category = require("../models/Category");
const Product = require("../models/Product");

// POST request to create a new product
route.post("/create-new", async function (req, res, next) {
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
            return res
                .status(400)
                .send(
                    "Bad request, check given parameters, product must have name"
                );
        }
        const categoryArray = category
            .split(",")
            .map((category) => category.trim());

        for (const categoryName of categoryArray) {
            // check collection for a duplicate
            const foundCategory = await Category.find({ name: categoryName });

            // make new category if no duplicate
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
            return res.status(200).send("New product has been added");
        } else {
            return res.status(400).send("Could not make the new product.");
        }
    } catch (error) {
        next(error);
    }
});

// PUT request to update product using its id
route.put("/update/:id", async function (req, res, next) {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(400).send("Bad request, check given parameters");
        }
        const { name, category, description, logoImageURL, productURL } =
            req.body;

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
        res.status(200).json(updatedProduct);
    } catch (error) {
        next(error);
    }
});

/* GET request returns list of all products
 * Query parameter to filter by product category
 */
route.get("/discover/:category", async function (req, res, next) {
    try {
        const category = req.params.category;
        if (!category) {
            res.status(400).send("Bad request, check given parameters");
            return;
        }
        // When API receives a specific category
        const query = {};
        if (category) {
            query.category = { $in: [new RegExp(`^${category}$`, "i")] };
        }

        // If API receives default value 'all'
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

// GET request to get a product using its id
route.get("/:id", async function (req, res, next) {
    try {
        const productId = req.params.id;
        if (!productId) {
            res.status(400).send("Bad request, check given parameters");
            return;
        }
        const result = await Product.findById(productId);
        if (!result) {
            res.status(404).send("No product found with given ID");
            return;
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST reequest to add a new comment to a product using its id
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

// GET request to upvote a product using its id
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
