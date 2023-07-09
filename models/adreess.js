const mongoose = require("mongoose");

const AdreessSchema = new mongoose.Schema(
  {
    calle: {
      type: String,
      required: true,
    },
    numeroExt: {
      type: String,
      required: true,
    },
    numeroInt: {
      type: String,
    },
    colonia: {
      type: String,
      required: true,
    },
    municipio: {
      type: String,
      required: true,
    },
    estado: {
      type: String,
      required: true,
    },
    cp: {
      type: String,
      required: true,
    },
    pais: {
      type: String,
      required: true,
    },
    referencia: {
      type: String,
    },

    principal: {
      type: Boolean,
      default: false,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Adreess = mongoose.model("Adreess", AdreessSchema);

module.exports = Adreess;
