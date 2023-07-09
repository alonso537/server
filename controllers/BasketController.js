const Basket = require("../models/basket");

exports.AddToBasket = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const basket = await Basket.findOne({ user: req.user });

    if (basket) {
      //existe el carrito para el usuario
      let productIndex = basket.products.findIndex(
        (p) => p.product == productId,
      );

      // console.log(productIndex);

      //si existe el producto en el carrito lo actualizo
      if (productIndex > -1) {
        let productItem = basket.products[productIndex];
        productItem.quantity += quantity;
        basket.products[productIndex] = productItem;
      } else {
        //si no existe el producto en el carrito lo agrego
        basket.products.push({ product: productId, quantity });
      }

      //actualizo el carrito
      await basket.save();
      //devuelvo el carrito
      return res.status(201).json({ basket });
    }

    //si no existe el carrito para el usuario
    const newBasket = await Basket.create({
      user: req.user,
      products: [{ product: productId, quantity }],
    });

    //devuelvo el carrito
    return res.status(201).json({ basket: newBasket });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllBasket = async (req, res) => {
  try {
    const basket = await Basket.findOne({ user: req.user }).populate({
      path: "products.product",
    });

    if (!basket)
      return res
        .status(404)
        .json({ message: "No hay carrito para este usuario" });

    return res.status(200).json({ basket });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteProductForBasket = async (req, res) => {
  try {
    const { id } = req.params;

    const { quantity = 1 } = req.query;

    // console.log(id);

    const basket = await Basket.findOne({ user: req.user });

    if (!basket)
      return res
        .status(404)
        .json({ message: "No hay carrito para este usuario" });

    let productIndex = basket.products.findIndex((p) => p.product == id);

    console.log(productIndex);

    //si existe el producto en el carrito lo actualizo o lo elimino dependiendo de la cantidad
    if (productIndex > -1) {
      let productItem = basket.products[productIndex];

      if (productItem.quantity > quantity) {
        productItem.quantity -= quantity;
        basket.products[productIndex] = productItem;
      } else {
        basket.products.splice(productIndex, 1);
      }
    }

    //actualizo el carrito
    await basket.save();

    //devuelvo el carrito
    return res.status(201).json({ basket });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
