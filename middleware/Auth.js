const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.isAuthenticate = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ msg: "No estas autorizado" });
  }

  const token = req.headers.authorization.split(" ")[1];

  //   console.log(token);
  try {
    // Verificar el token
    const verifyToken = jwt.verify(token, process.env.SECRET);
    // console.log(verifyToken);
    //checar si no esta expirado
    if (verifyToken.exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({ msg: "El token ha expirado" });
    }
    // Si el token es valido, extraer el id del usuario
    req.user = verifyToken.id;
    next();
  } catch (error) {
    next(error);
  }
};

exports.isAdmin = async (req, res, next) => {
  // console.log(req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).json({ msg: "No estas autorizado" });
  }

  const token = req.headers.authorization.split(" ")[1];

  // console.log(token);
  try {
    // Verificar el token
    const verifyToken = jwt.verify(token, process.env.SECRET);
    // console.log(verifyToken);
    //checar si no esta expirado
    if (verifyToken.exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({ msg: "El token ha expirado" });
    }
    // Si el token es valido, extraer el id del usuario
    req.user = verifyToken.id;

    //obtener al usuario
    const user = await User.findById(req.user);

    //checam,os si el usuario existe
    if (!user) {
      return res.status(401).json({ msg: "El usuario no existe" });
    }

    if (user.role === "admin") {
      next();
    } else {
      return res.status(401).json({ msg: "No estas autorizado" });
    }
  } catch (error) {
    next(error);
  }
};
