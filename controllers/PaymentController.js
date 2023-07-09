const User = require("../models/User");
const Payment = require("../models/payment");
const Pedido = require("../models/pedido");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
const Product = require("../models/products");

const endpointSecret = process.env.WEBHOOKS_SECRET || "";

exports.checkoutSession = async (req, res) => {
  try {
    const { pedidoId } = req.body;

    //recuperar el pedido de la base de datos
    const pedido = await Pedido.findById(pedidoId)
      .populate("user")
      .populate("products.product");

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // console.log(pedido);

    // //crear la sesión de pago de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: pedido.products[0].product.title,
            },
            unit_amount: pedido.total * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",

      success_url: `${process.env.CLIENT_URL}/success?pedido=${pedidoId}`,
      cancel_url: `${process.env.CLIENT_URL}/user/pedidos`,
      metadata: {
        pedidoId: pedido._id.toString(),
        userId: pedido.user._id.toString(),
      },
    });

    // //actualizar el pedido con la sesión de pago
    pedido.checkoutSessionId = session.id;

    await pedido.save();

    //redirect a la página de pago
    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear la sesión de pago" });
  }
};

exports.webhook = async (req, res) => {
  try {
    const payload = req.body;

    const payloadString = JSON.stringify(payload, null, 2);

    const secret = process.env.WEBHOOKS_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: secret,
    });

    const event = stripe.webhooks.constructEvent(payloadString, header, secret);

    console.log(event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log(session);

      //obtener el pedidoId del metadata
      const pedidoId = session.metadata.pedidoId;
      const userId = session.metadata.userId;

      const pedido = await Pedido.findById(pedidoId);

      //obtener al usuario
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      // console.log(pedido);

      if (pedido) {
        pedido.status = "Completado";
        //redudir el stock de acuerdo a la cantidad de productos
        pedido.products.forEach(async (p) => {
          //obtenemos el producto de la base de datos
          const product = await Product.findById(p.product);

          if (product) {
            product.stock = product.stock - p.quantity;

            await product.save();
          }

          console.log("Stock actualizado");
        });

        await pedido.save();
      }

      console.log("Pedido actualizado");

      //enviar el correo electrónico
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        port: 465,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.MAIL_USER,
        to: user.email,
        subject: `Pedido ${pedidoId} completado`,
        html: `
        <h1>¡Gracias por tu compra!</h1>
        <p>El pago de tu pedido ${pedidoId} se ha completado correctamente.</p>
        <p>En breve recibirás tu pedido en la dirección indicada.</p>
        <p>Gracias por confiar en nosotros.</p>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Error al enviar el correo electrónico" });
        }
        console.log("Correo electrónico enviado");
      });

      // fulfillOrder(lineItems);

      //crear el payment y guardarlo en la base de datos
      const payment = await Payment.create({
        user: userId,
        chargeId: session.payment_intent,
        amount: pedido.total,
        pedido: pedidoId,
        timestamp: Date.now(),
      });

      await payment.save();

      res.status(200).end();
    }

    // console.log(payloadString);
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
    console.log(error);
    // res.status(400).send(`Webhook error: ${error.message}`);
  }
};

exports.getPayments = async (req, res) => {
  try {
    //obtener un sort por fecha
    const { sort, fecha } = req.query;

    let querySort;

    if (sort === "asc") {
      //obtener los pagos de menor a mayor
      querySort = { amount: 1 };
    }
    if (sort === "desc") {
      //obtener los pagos de mayor a menor
      querySort = { amount: -1 };
    }

    if (!sort) {
      //obtener todos los pagos del ultimo hecho al primero
      querySort = { timestamp: -1 };
    }

    //filtrar por fecha
    if (fecha === "hoy") {
      //obtener los pagos de hoy
      const today = new Date();
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );

      const payments = await Payment.find({
        timestamp: { $gte: start, $lt: end },
      })
        .sort(querySort)
        .populate("user")
        .populate("pedido");

      return res.status(200).json(payments);
    }

    if (fecha === "ayer") {
      //obtener los pagos de ayer
      const today = new Date();
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 1,
      );
      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      const payments = await Payment.find({
        timestamp: { $gte: start, $lt: end },
      })
        .sort(querySort)
        .populate("user")
        .populate("pedido");

      return res.status(200).json(payments);
    }

    if (fecha === "ultimos7dias") {
      //obtener los pagos de los ultimos 7 dias
      const today = new Date();
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 7,
      );
      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );

      const payments = await Payment.find({
        timestamp: { $gte: start, $lt: end },
      })
        .sort(querySort)
        .populate("user")
        .populate("pedido");

      return res.status(200).json(payments);
    }

    if (fecha === "ultimos30dias") {
      const today = new Date();
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 30,
      );

      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );

      const payments = await Payment.find({
        timestamp: { $gte: start, $lt: end },
      })
        .sort(querySort)
        .populate("user")
        .populate("pedido");

      return res.status(200).json(payments);
    }

    if (fecha === "ultimos90dias") {
      const today = new Date();
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 90,
      );

      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );

      const payments = await Payment.find({
        timestamp: { $gte: start, $lt: end },
      })
        .sort(querySort)
        .populate("user")
        .populate("pedido");

      return res.status(200).json(payments);
    }

    if (fecha === "ultimoMes") {
      //obtener los pagos del ultimo mes
      const today = new Date();
      const start = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate(),
      );
      const end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
      );

      const payments = await Payment.find({
        timestamp: { $gte: start, $lt: end },
      })
        .sort(querySort)
        .populate("user")
        .populate("pedido");

      return res.status(200).json(payments);
    }

    if (fecha === "ultimos180dias") {
      const today = new Date();
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 180,
      );

      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );

      const payments = await Payment.find({
        timestamp: { $gte: start, $lt: end },
      })
        .sort(querySort)
        .populate("user")
        .populate("pedido");

      res.status(200).json(payments);
    }

    if (fecha === "ultimoAnio") {
      //obtener los pagos del ultimo año
      const today = new Date();
      const start = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate(),
      );

      const end = new Date(
        today.getFullYear() + 1,
        today.getMonth(),
        today.getDate(),
      );

      const payments = await Payment.find({
        timestamp: { $gte: start, $lt: end },
      })

        .sort(querySort)
        .populate("user")
        .populate("pedido");

      return res.status(200).json(payments);
    }

    const payments = await Payment.find({})
      .sort(querySort)
      .populate("user")
      .populate("pedido");

    res.status(200).json(payments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener los pagos" });
  }
};

exports.getAmountOfPaymentsForMounth = async (req, res) => {
  try {
    //obtener los pagos del ultimo año
    const today = new Date();
    const start = new Date(
      today.getFullYear() - 1,
      today.getMonth(),
      today.getDate(),
    );

    const end = new Date(
      today.getFullYear() + 1,
      today.getMonth(),
      today.getDate(),
    );

    const payments = await Payment.find({
      timestamp: { $gte: start, $lt: end },
    });

    //crear un arreglo con los meses del año
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    // agregar los pagos a cada mes
    const monthsWithPayments = months.map((month) => {
      const paymentsForMonth = payments.filter((payment) => {
        const paymentMonth = payment.timestamp.getMonth();
        return month === months[paymentMonth];
      });

      return {
        month,
        payments: paymentsForMonth,
      };
    });

    //obtener el total de cada mes
    const monthsWithTotal = monthsWithPayments.map((month) => {
      const total = month.payments.reduce((acc, payment) => {
        return acc + payment.amount;
      }, 0);

      return {
        month: month.month,
        total,
      };
    });

    res.status(200).json(monthsWithTotal);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener los pagos" });
  }
};

exports.stats = async (req, res) => {
  try {
    //obtener los pagos del ultimo mes
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate(),
    );

    const end = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    );

    const paymentsLastMount = await Payment.find({
      timestamp: { $gte: start, $lt: end },
    });

    //obtener los pagos del mes actual
    const start2 = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const end2 = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    );

    const paymentsCurrentMount = await Payment.find({
      timestamp: { $gte: start2, $lt: end2 },
    });

    //obtener el porcentaje de crecimiento de los pagos del mes actual con respecto al mes anterior usando amount como referencia en formato porcentaje
    // const growth = ((paymentsCurrentMount.length - paymentsLastMount.length) / paymentsLastMount.length) * 100;

    //obtener el total de los pagos del mes actual
    const total = paymentsCurrentMount.reduce((acc, payment) => {
      return acc + payment.amount;
    }, 0);

    //obtener el total de los pagos del mes anterior
    const totalLastMount = paymentsLastMount.reduce((acc, payment) => {
      return acc + payment.amount;
    }, 0);

    //obtener el porcentaje de crecimiento de los pagos del mes actual con respecto al mes anterior usando amount como referencia en formato porcentaje
    const growthAmount = ((total - totalLastMount) / totalLastMount) * 100;

    //obtener la cantidad de usuarios registrados en el mes actual y en el mes anterior
    const usersLastMount = await User.find({
      createdAt: { $gte: start, $lt: end },
    });

    // console.log(usersLastMount);
    const usersCurrentMount = await User.find({
      createdAt: { $gte: start2, $lt: end2 },
    });

    //obtener el porcentaje de crecimiento de los usuarios del mes actual con respecto al mes anterior
    const growthUsers =
      ((usersCurrentMount.length - usersLastMount.length) /
        usersLastMount.length) *
      100;

    //obtener la cantidad de pedidos en el mes actual y en el mes anterior
    const pedidosLastMount = await Pedido.find({
      createdAt: { $gte: start, $lt: end },
    });

    const pedidosCurrentMount = await Pedido.find({
      createdAt: { $gte: start2, $lt: end2 },
    });

    //obtener el porcentaje de crecimiento de los pedidos del mes actual con respecto al mes anterior
    const growthPedidos =
      ((pedidosCurrentMount.length - pedidosLastMount.length) /
        pedidosLastMount.length) *
      100;

    //enviar los datos
    res.status(200).json({
      growthAmount,
      total,
      growthUsers: growthUsers || 0,
      growthPedidos,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener los pagos" });
  }
};
