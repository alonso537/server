const Coupon = require("../models/Coupon");

exports.createCoupon = async (req, res) => {
  try {
    const { code, discount, expiry, type, product, category } = req.body;

    if (type === "especifico" && !product && !category) {
      return res.status(400).json({
        message:
          "Si el tipo es específico, debe especificar los productos o la categoria",
      });
    }

    if (type === "general" && product && category) {
      return res.status(400).json({
        message:
          "Si el tipo es general, no debe especificar los productos o la categoria",
      });
    }

    if ((!code, !discount, !expiry, !type)) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const couponExist = await Coupon.findOne({ code });

    if (couponExist) {
      return res.status(400).json({ message: "El cupón ya existe" });
    }

    const coupon = new Coupon({
      code,
      discount,
      expiry,
      type,
      product,
      category,
    });

    await coupon.save();

    res.status(201).json({ message: "Cupón creado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear el cupón" });
  }
};

exports.apply = async (req, res) => {
  try {
    // console.log(req.query);

    const { code, product, category } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const coupon = await Coupon.findOne({ code }).populate("product");

    if (!coupon) {
      return res.status(400).json({ message: "El cupón no existe" });
    }

    if (coupon.expiry < Date.now()) {
      return res.status(400).json({ message: "El cupón está vencido" });
    }

    if (coupon.type === "especifico") {
      if (coupon.product && coupon.product._id.toString() !== product) {
        return res
          .status(400)
          .json({ message: "El cupón no es válido para este producto" });
      }

      if (coupon.category && coupon.category !== category) {
        return res
          .status(400)
          .json({ message: "El cupón no es válido para esta categoría" });
      }
    }

    //buscar si el usuario existe en coupon.users
    let userExist;

    // console.log(coupon.users);
    coupon.users.forEach((user) => {
      if (user.toString() === req.user.toString()) {
        userExist = true;
      }
    });

    // console.log(userExist);
    if (userExist) {
      return res.status(400).json({ message: "El cupón ya fue aplicado" });
    }

    //actualizar el users agregando el usuario que aplico el cupon
    // console.log(req.user);
    coupon.users.push(req.user);

    await coupon.save();

    res
      .status(200)
      .json({ message: "Cupón aplicado", discount: coupon.discount, coupon });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al aplicar el cupón" });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("product");

    //checamos si la fecha de expiración es menor a la fecha actual y si es así, cambiamos el active a false caso contrario lo dejamos en true y lo guardamos
    coupons.forEach(async (coupon) => {
      if (coupon.expiry < Date.now()) {
        coupon.active = false;
      } else {
        coupon.active = true;
      }

      await coupon.save();
    });

    res.status(200).json({ message: "Cupones obtenidos", coupons });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener los cupones" });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const { code, discount, expiry, type, product, category } = req.body;

    if (type === "especifico" && !product && !category) {
      return res.status(400).json({
        message:
          "Si el tipo es específico, debe especificar los productos o la categoria",
      });
    }

    if (type === "general" && product && category) {
      return res.status(400).json({
        message:
          "Si el tipo es general, no debe especificar los productos o la categoria",
      });
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(400).json({ message: "El cupón no existe" });
    }

    coupon.code = code || coupon.code;
    coupon.discount = discount || coupon.discount;
    coupon.expiry = expiry || coupon.expiry;
    coupon.type = type || coupon.type;
    coupon.product = product || coupon.product;
    coupon.category = category || coupon.category;

    await coupon.save();

    res.status(200).json({ message: "Cupón actualizado", coupon });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al actualizar el cupón" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(400).json({ message: "El cupón no existe" });
    }

    await Coupon.findByIdAndDelete(id);

    res.status(200).json({ message: "Cupón eliminado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al eliminar el cupón" });
  }
};
