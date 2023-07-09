const Coupon = require("../models/Coupon");
const Basket = require("../models/basket");
const Pedido = require("../models/pedido");

exports.createPedido = async (req, res) => {
  try {
    const { basket, address, coupon } = req.body;

    if (!basket || !address) {
      return res.status(400).json({ msg: "Faltan datos" });
    }

    //obtener el basket del usuario
    const basketUser = await Basket.findById({ _id: basket }).populate(
      "products.product",
    );
    // console.log(basketUser);
    let subtotal = 0;

    for (let i = 0; i < basketUser.products.length; i++) {
      subtotal +=
        basketUser.products[i].product.price * basketUser.products[i].quantity;
    }
    // console.log(subtotal);

    //sumarle el 16% de iva
    const tax = subtotal * 0.16;
    let total = subtotal + tax;

    //si el total es menor a 1000 pesos, cobrar 100 pesos de envio
    if (total < 1000) {
      total += 499;
    }

    let discountTotal = 0;
    //obtener el cupon de descuento
    if (coupon) {
      const { discount } = await Coupon.findById({ _id: coupon });
      console.log(discount);
      discountTotal = (subtotal * discount) / 100;
      total -= discountTotal;
      //   total -= total * (discount / 100);
    }

    const pedido = await Pedido.create({
      user: req.user,
      products: basketUser.products,
      total,
      address,
      coupon,
    });
    await pedido.save();

    await Basket.findByIdAndDelete({ _id: basket });

    res.status(200).json({ msg: "Pedido creado", pedido });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};

exports.getPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ user: req.user })
      // .populate("adreess")
      .populate("products.product");
    res.status(200).json({ pedidos });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};

exports.getPedido = async (req, res) => {
  try {
    // console.log(req.params.id);
    const { id } = req.params;

    const pedido = await Pedido.findById({ _id: id })
      // .populate("address")
      .populate("products.product");

    if (!pedido) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

    if (pedido.user.toString() !== req.user) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    res.status(200).json({ pedido });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};
