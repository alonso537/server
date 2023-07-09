const express = require("express");
const { isAuthenticate } = require("../middleware/Auth");
const {
  createPedido,
  getPedido,
  getPedidos,
} = require("../controllers/PedidoController");

const router = express.Router();

router.post("/create", isAuthenticate, createPedido);
router.get("/get/:id", isAuthenticate, getPedido);
router.get("/get", isAuthenticate, getPedidos);

module.exports = router;
