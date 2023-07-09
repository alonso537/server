const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { fullName, userName, email, password } = req.body;

    if (!fullName || !userName || !email || !password) {
      return res.status(400).json({
        msg: "Todos los campos son obligatorios",
      });
    }

    // Validar que el usuario no exista checando el email y el userName
    const userExist = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (userExist) {
      return res.status(400).json({
        msg: "El usuario ya existe",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync(password, salt);

    //crear un codigo de confirmacio de solo 6 digitos
    const codeConfirmation =
      Math.floor(Math.random() * (999999 - 100000)) + 100000;

    // Crear el nuevo usuario
    const user = await User.create({
      email,
      fullName,
      userName,
      password: passHash,
      codeConfirmation,
    });

    if (!user) {
      return res.status(400).json({
        msg: "Hubo un error al crear el usuario",
      });
    }

    // console.log(user);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailoptions = {
      from: "Remitente",
      to: user.email,
      subject: "Confirma tu cuenta",
      html: `
        <h1>Hola ${user.fullName}</h1>
        <p>Gracias por registrarte en mi app</p>
        <p>Para confirmar tu cuenta ingresa el codigo </p>
        <h3>${user.codeConfirmation}</h3>
        `,
    };

    transporter.sendMail(mailoptions, (error, info) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ msg: "Hubo un error al enviar el email" });
      }
      console.log("Email enviado");
      res.status(200).json({ msg: "Email enviado" });
    });

    await user.save();

    res.status(201).json({
      msg: "Usuario Creado Correctamente checa tu email para confirmar tu cuenta, no olvides revisar tu bandeja de spam",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};

exports.confirmAccount = async (req, res) => {
  try {
    const { codeConfirmation, email } = req.body;

    if (!codeConfirmation) {
      return res
        .status(400)
        .json({ msg: "El codigo de confirmacion es obligatorio" });
    }

    if (!email) {
      return res.status(400).json({ msg: "El email es obligatorio" });
    }

    //chequear que el codigo de confirmacion exista y sea igual al que se envio
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "El usuario no existe" });
    }

    if (user.codeConfirmation !== codeConfirmation) {
      return res
        .status(400)
        .json({ msg: "El codigo de confirmacion es incorrecto" });
    }

    //cambiar el estado de la cuenta a activo
    user.active = true;
    user.codeConfirmation = "";

    await user.save();

    res.status(200).json({ msg: "Cuenta activada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });

    // Validar que el usuario exista
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "El usuario no existe" });
    }

    // // Validar que el usuario este activo
    // if (!user.active) {
    //   return res.status(400).json({ msg: "El usuario no esta activo" });
    // }

    // Validar que el password sea correcto
    const passCorrect = bcrypt.compareSync(password, user.password);

    if (!passCorrect) {
      return res.status(400).json({ msg: "El password es incorrecto" });
    }

    // Crear el token
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.SECRET,
      {
        expiresIn: "30d",
      },
    );

    res.status(200).json({ msg: "Login correcto", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};

exports.forwardPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "El email es obligatorio" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "El usuario no existe" });
    }

    //crear un codigo de confirmacio de solo 6 digitos
    const codeConfirmation =
      Math.floor(Math.random() * (999999 - 100000)) + 100000;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailoptions = {
      from: "Remitente",
      to: user.email,
      subject: "Recuperar contraseña",
      html: `
        <h1>Hola ${user.fullName}</h1>
        <p>Para recuperar tu contraseña ingresa el codigo </p>
        <h3>${codeConfirmation}</h3>
        `,
    };

    transporter.sendMail(mailoptions, (error, info) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ msg: "Hubo un error al enviar el email" });
      }
      console.log("Email enviado");
      res.status(200).json({ msg: "Email enviado" });
    });

    user.codeConfirmation = codeConfirmation;

    await user.save();

    res.status(200).json({
      msg: "Codigo enviado correctamente checa tu email, y no te olvides de checar tambien la bandeja de spam",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};

exports.cambiarPassword = async (req, res) => {
  try {
    const { codeConfirmation, password } = req.body;

    if (!codeConfirmation) {
      return res
        .status(400)
        .json({ msg: "El codigo de confirmacion es obligatorio" });
    }

    if (!password) {
      return res.status(400).json({ msg: "El password es obligatorio" });
    }

    //chequear que el codigo de confirmacion exista y sea igual al que se envio
    const user = await User.findOne({ codeConfirmation });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "El codigo de confirmacion es incorrecto" });
    }

    //checar que la contraseña no sea igual a la anterior
    const passCorrect = bcrypt.compareSync(password, user.password);

    if (passCorrect) {
      return res
        .status(400)
        .json({ msg: "La contraseña no puede ser igual a la anterior" });
    }

    //cambiar el password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    user.password = hash;

    user.codeConfirmation = "";

    await user.save();

    res.status(200).json({ msg: "Contraseña cambiada correctamente" });

    // console.log(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.user;

    // console.log(userId);

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({ msg: "El usuario no existe" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};
