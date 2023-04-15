const { Router } = require("express");
const route = Router();

const Category = require("../models/Category");
const Product = require("../models/Product");

// create a category
route.post("/create-category", async function (req, res, next) {
    try {
        const categoryName = req.body.name;
        if (!categoryName)
            res.status(400).send("Bad request, check given parameters");

        const newCategory = {
            name: categoryName,
        };

        // find collection for a duplicate, do not use callback
        const foundCategory = await Category.find({ name: categoryName });

        // make new category accordingly
        if (foundCategory.length === 0) {
            await Category.create(newCategory);
            res.send("New category added");
            console.log("New category added");
        } else {
            res.status(409).send(
                "Bad request, resource with same name already exists"
            );
        }
    } catch (error) {
        next(error);
        console.log(error);
    }
});

// create a product
route.post("/create-product", async function (req, res, next) {
    try {
        const name = req.body.name;
        if (!name)
            res.status(400).send(
                "Bad request, check given parameters, product must have name"
            );
        const category = req.body.category;
        const description = req.body.description;
        const logoImageURL = req.body.logoImageURL;
        const comments = req.body.comments;
        const upvoteCount = req.body.upvoteCount;
        const productURL = req.body.productURL;

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
route.get("/products", async function (req, res, next) {
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

module.exports = route;
