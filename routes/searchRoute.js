const express = require("express");
const Product = require("../models/products");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    //tomamos el parametro de busqueda del query string
    const search = req.query.search;

    //si no hay parametro de busqueda, devolvemos un error
    if (!search) {
      return res.status(400).json({ message: "Missing search term" });
    }

    //Creamos un objeto de consulta con regex para buscar en la base de datos los campos title, description y category
    const query = {
      $or: [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
      ],
    };

    //Buscamos productos que coincidan con la consulta
    const products = await Product.find(query);

    //Devolvemos los productos encontrados
    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
