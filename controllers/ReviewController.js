const User = require("../models/User");
const Product = require("../models/products");
const Review = require("../models/reviews");

exports.addReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rating, text } = req.body;

    if (!rating || !text) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // // traer el usuario que esta haciendo el review
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // console.log(user);

    // //traer el producto que se esta revieweando
    const product = await Product.findById(id);

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    // console.log(product);

    const review = await Review.create({
      user: req.user,
      userImage: user.photo,
      userName: user.fullName,
      rating,
      text,
      product: product._id,
    });

    // console.log(review);

    product.reviews.push(review._id);

    // console.log(product.reviews);

    //obtener los objetos completos de las reseñas
    const reviews = await Review.find({ _id: { $in: product.reviews } });

    // Calcular la calificación promedio
    product.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    await review.save();

    res.status(200).json({ message: "Review added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewForProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ product: id })
      .sort({ date: -1 })
      .populate("user", "fullName photo");

    if (!reviews) {
      return res.status(200).json({ message: "No reviews found" });
    }

    res.status(200).json({ reviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
