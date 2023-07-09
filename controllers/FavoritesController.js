const Favorites = require("../models/favorites");

exports.addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;

    const favorite = await Favorites.findOne({ user: req.user });

    if (favorite) {
      if (favorite.products.includes(productId)) {
        return res
          .status(400)
          .json({ message: "Product already in favorites" });
      }
      favorite.products.push(productId);
      await favorite.save();
      return res.status(201).json({ message: "Product added to favorites" });
    }

    const newFavorite = await Favorites.create({
      user: req.user,
      products: [productId],
    });

    await newFavorite.save();

    return res.status(201).json({ message: "Product added to favorites" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorites.findOne({ user: req.user }).populate(
      "products",
    );

    if (!favorites) {
      return res.status(404).json({ message: "Favorites not found" });
    }

    return res.status(200).json({ favorites });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Path: controllers\ProductsController.js
exports.deleteFavorite = async (req, res) => {
  try {
    const { productId } = req.body;

    const favorite = await Favorites.findOne({ user: req.user });

    if (!favorite) {
      return res.status(404).json({ message: "Favorites not found" });
    }

    if (!favorite.products.includes(productId)) {
      return res.status(400).json({ message: "Product not in favorites" });
    }

    favorite.products = favorite.products.filter(
      (product) => product.toString() !== productId,
    );

    await favorite.save();

    return res.status(200).json({ message: "Product removed from favorites" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
