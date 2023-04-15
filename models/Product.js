const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        category: { type: Array, default: [] },
        description: { type: String },
        logoImageURL: { type: String },
        comments: { type: Array, default: [] },
        upvoteCount: { type: Number },
        productURL: { type: String },
    },
    { timestamps: true }
);

const Product = new mongoose.model("Product", productSchema);

module.exports = Product;
