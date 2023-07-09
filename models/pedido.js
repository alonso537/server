const mongoose = require("mongoose");

const PedidoSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Pendiente",
      enum: ["Pendiente", "Enviado", "Entregado", "Cancelado", "Completado"],
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    checkoutSessionId: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
);

const Pedido = mongoose.model("Pedido", PedidoSchema);

module.exports = Pedido;
