const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chargeId: {
    // Esto se proporcionará por Stripe
    type: String,
    required: true,
  },
  amount: {
    // En centavos
    type: Number,
    required: true,
  },
  timestamp: {
    // Cuando se hizo el pago
    type: Date,
    default: Date.now,
  },
  pedido: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pedido",
  },
});

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
