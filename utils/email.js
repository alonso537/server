// const nodemailer = require("nodemailer");

// const enviarEmail = (email, fullName, userName, codeConfirmation) => {
//   if (!email || !fullName || !userName || !codeConfirmation) {
//     return console.log("Faltan datos para enviar el email");
//   }

//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     port: 465,
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASSWORD,
//     },
//   });
// };

// const mailoptions = {
//   from: "Remitente",
//   to: email,
//   subject: "Confirma tu cuenta",
//   html: `
//     <h1>Hola ${fullName}</h1>
//     <p>Gracias por registrarte en mi app</p>
//     <p>Para confirmar tu cuenta ingresa el codigo </p>
//     <h3>${codeConfirmation}</h3>
//     `,
// };

// transporter.sendMail(mailoptions, (error, info) => {
//   if (error) {
//     console.log(error);
//     return res.status(500).json({ msg: "Hubo un error al enviar el email" });
//   }
//   console.log("Email enviado");
//   res.status(200).json({ msg: "Email enviado" });
// });

// module.exports = enviarEmail;
