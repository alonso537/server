const express = require("express");
const {
  getAllProducts,
  getLatestProducts,
  getMostSales,
  getMostViews,
  getLatestProduct,
  getProductById,
  getSugerencias,
  createProduct,
  updateProduct,
  uploadUpdateImage,
  deleteImageForDb,
  deleteProduct,
} = require("../controllers/ProductController");
const { isAdmin, isAuthenticate } = require("../middleware/Auth");
const router = express.Router();

router.get("/", getAllProducts);
router.get("/latest", getLatestProducts);
router.get("/mostsales", getMostSales);
router.get("/mostviews", getMostViews);
router.get("/latestproduct", getLatestProduct);
router.get("/:id", getProductById);
router.get("/sugerencias/:id", getSugerencias);
router.post("/", isAuthenticate, isAdmin, createProduct);
router.put("/:id", isAuthenticate, isAdmin, updateProduct);
router.put("/upload/:id", isAuthenticate, isAdmin, uploadUpdateImage);
router.put("/deleteimage/:id", isAuthenticate, isAdmin, deleteImageForDb);
router.delete("/:id", isAuthenticate, isAdmin, deleteProduct);
// router.get("/buscar", searchProducts);

module.exports = router;
