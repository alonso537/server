const User = require("../models/User");
const { eliminarImagen, subirImagen } = require("../utils/cloudunary");

exports.updateUserClient = async (req, res) => {
  try {
    const { fullName, userName, email, phone } = req.body;

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    //si viene el campo fullName, userName, email, phone, entonces actualizamos el usuario pero si el campo que viene ya existe en la base de datos entonces no lo actualizamos para evitar que se repitan los datosue no marque duplicados
    if (fullName) {
      user.fullName = fullName;
    }

    if (userName) {
      user.userName = userName;
    }

    if (email) {
      user.email = email;
    }

    if (phone) {
      user.phone = phone;
    }

    await user.save();

    res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

exports.changeFoto = async (req, res) => {
  try {
    const { photo } = req.files;

    if (!photo) {
      return res
        .status(400)
        .json({ message: "No se ha seleccionado ninguna imagen" });
    }

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    //checamos si el usuario ya tiene una foto de perfil, si es asi la eliminamos
    if (user.photo) {
      // https://res.cloudinary.com/dkamqaxbi/image/upload/v1685302226/sophia/hjyxt04camxwlem55cul.jpg

      //obtener el public_id de la imagen
      const nombreArr = user.photo.split("/");
      const nombre = nombreArr[nombreArr.length - 1];
      const [public_id] = nombre.split(".");
      //eliminar la imagen de cloudinary
      await eliminarImagen(public_id);
    }

    //subir la nueva imagen
    const result = await subirImagen(photo.tempFilePath);

    user.photo = result;

    await user.save();

    res
      .status(200)
      .json({ message: "Foto de perfil actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page, search, limit, sort } = req.query;

    const limite = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * limite;

    let sortQuery = { createdAt: -1 };

    if (sort === "asc") {
      sortQuery = { createdAt: 1 };
    }

    if (sort === "desc") {
      sortQuery = { createdAt: -1 };
    }

    let searchQuery = {};

    if (search) {
      searchQuery = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { userName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(searchQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limite);

    const totalUsers = await User.countDocuments();

    const totalPages = Math.ceil(totalUsers / limite);

    const nextPage = currentPage + 1 <= totalPages ? currentPage + 1 : null;
    const prevPage = currentPage - 1 >= 1 ? currentPage - 1 : null;

    res.status(200).json({
      message: "Usuarios obtenidos correctamente",
      users,
      totalUsers,
      totalPages,
      currentPage,
      nextPage,
      prevPage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    //si el usuario es admin se cambia a user y viceversa
    if (user.role === "admin") {
      user.role = "user";
    } else {
      user.role = "admin";
    }

    await user.save();

    res
      .status(200)
      .json({ message: "Rol de usuario actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};
