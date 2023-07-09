const express = require("express");
const cors = require("cors");
const conectarDb = require("./DB/db");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const app = express();

conectarDb();

//middlewares
app.use(express.json());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  }),
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/seed", require("./routes/Seed"));
app.use("/api/products", require("./routes/ProductRoute"));
app.use("/api/search", require("./routes/searchRoute"));
app.use("/api/basket", require("./routes/basketRoute"));
app.use("/api/favorite", require("./routes/favoritesRoute"));
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/adreess", require("./routes/adreessRoute"));
app.use("/api/coupon", require("./routes/couponRoute"));
app.use("/api/pedido", require("./routes/pedidoRoute"));
app.use("/api/review", require("./routes/reviewRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
