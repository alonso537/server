const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  especifications: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
  },
  totalViews: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  galery: {
    type: Array,
    default: [],
  },
  reviews: {
    type: Array,
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  categories: {
    type: Array,
    default: "Acción",
    // enum: [
    //   "Acción",
    //   "Aventura",
    //   "Rol (RPG)",
    //   "Estrategia",
    //   "Deportes",
    //   "Carreras",
    //   "Simulación",
    //   "Puzzle",
    //   "Horror de supervivencia",
    //   "Disparos en primera persona (FPS)",
    //   "Disparos en tercera persona (TPS)",
    //   "Battle Royale",
    //   "Plataformas",
    //   "Lucha",
    //   "Música y Ritmo",
    //   "MMO (Juego de rol multijugador masivo en línea)",
    //   "MOBA (Arena de batalla multijugador en línea)",
    //   "SandBox (Caja de arena)",
    //   "Stealth (Sigilo)",
    //   "Realidad virtual (VR)",
    //   "Realidad aumentada (AR)",
    //   "indie",
    // ],
  },
  clasification: {
    type: String,
    default: "T (Teen / Adolescentes)",
    enum: [
      "E (Everyone / Para todos)",
      "E10+ (Everyone 10 and older / Para todos mayores de 10 años)",
      "T (Teen / Adolescentes)",
      "M (Mature / Madurez)",
      "AO (Adults Only / Solo Adultos)",
      "RP (Rating Pending / Clasificación Pendiente)",
    ],
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
