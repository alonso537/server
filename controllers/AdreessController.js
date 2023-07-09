const Adreess = require("../models/adreess");

exports.createAdreess = async (req, res) => {
  try {
    const {
      calle,
      numeroExt,
      numeroInt,
      colonia,
      municipio,
      estado,
      cp,
      pais,
      referencia,
      principal,
    } = req.body;

    if (
      !calle ||
      !numeroExt ||
      !colonia ||
      !municipio ||
      !estado ||
      !cp ||
      !pais
    ) {
      return res.status(400).json({ msg: "Faltan datos" });
    }

    //buscamos si ya existe una direccion principal para el usuario y no es asi la creamos como principal y si ya existe una principal la creamos como no principal
    const adreess = await Adreess.find({ usuario: req.user });

    let principalAd = principal || false;

    if (adreess.length === 0) {
      principalAd = true;
    } else {
      // si el usuario quiere crear una direccion principal y ya tiene una principal se la quitamos a la que ya tiene
      if (principal) {
        const adreessPrincipal = await Adreess.findOne({
          usuario: req.user,
          principal: true,
        });
        if (adreessPrincipal) {
          adreessPrincipal.principal = false;
          await adreessPrincipal.save();
        }
      }
    }

    const newAdreess = new Adreess({
      calle,
      numeroExt,
      numeroInt,
      colonia,
      municipio,
      estado,
      cp,
      pais,
      referencia,
      principal: principalAd,
      usuario: req.user,
    });

    await newAdreess.save();

    res.status(201).json({ msg: "Direccion creada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};

exports.getAdreess = async (req, res) => {
  try {
    const adreess = await Adreess.find({ usuario: req.user });

    if (adreess.length === 0) {
      return res.status(404).json({ msg: "No se encontraron direcciones" });
    }

    res.status(200).json({ adreess });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};

exports.deleteAdreess = async (req, res) => {
  try {
    const { id } = req.params;

    const adreess = await Adreess.findById(id);

    if (!adreess) {
      return res.status(404).json({ msg: "No se encontro la direccion" });
    }

    if (adreess.usuario.toString() !== req.user) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // si la direccion que se quiere eliminar es la principal se busca otra direccion para ponerla como principal si hay mas de una direccion que no sea la principal se pone como principal la primera que se encuentre
    if (adreess.principal) {
      const adreessPrincipal = await Adreess.findOne({
        usuario: req.user,
        principal: false,
      });
      if (adreessPrincipal) {
        adreessPrincipal.principal = true;
        await adreessPrincipal.save();
      }
    }

    //adreess.remove is not a function
    await Adreess.findByIdAndDelete(id);

    res.status(200).json({ msg: "Direccion eliminada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};

exports.updateAdreess = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      calle,
      numeroExt,
      numeroInt,
      colonia,
      municipio,
      estado,
      cp,
      pais,
      referencia,
      principal,
    } = req.body;

    const adreess = await Adreess.findById(id);

    // si la direccion que se quiere actualizar no existe
    if (!adreess) {
      return res.status(404).json({ msg: "No se encontro la direccion" });
    }

    // si la direccion que se quiere actualizar no pertenece al usuario
    if (adreess.usuario.toString() !== req.user) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // si el usuario quiere actualizar una direccion principal y ya tiene una principal se la quitamos a la que ya tiene
    if (principal) {
      const adreessPrincipal = await Adreess.findOne({
        usuario: req.user,
        principal: true,
      });
      if (adreessPrincipal) {
        adreessPrincipal.principal = false;
        await adreessPrincipal.save();
      }
    }

    //actualizamos la direccion con los datos que nos envia el usuario y si no nos envia nada se queda con los datos que ya tenia
    adreess.calle = calle || adreess.calle;
    adreess.numeroExt = numeroExt || adreess.numeroExt;
    adreess.numeroInt = numeroInt || adreess.numeroInt;
    adreess.colonia = colonia || adreess.colonia;
    adreess.municipio = municipio || adreess.municipio;
    adreess.estado = estado || adreess.estado;
    adreess.cp = cp || adreess.cp;
    adreess.pais = pais || adreess.pais;
    adreess.referencia = referencia || adreess.referencia;
    adreess.principal = principal || adreess.principal;

    await adreess.save();

    res.status(200).json({ msg: "Direccion actualizada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};
