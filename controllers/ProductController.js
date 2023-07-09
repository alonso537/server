const Product = require("../models/products");
const { eliminarImagen, subirImagen } = require("../utils/cloudunary");

exports.getAllProducts = async (req, res) => {
  try {
    const {
      page,
      minPrice,
      maxPrice,
      sort,
      minDate,
      maxDate,
      category,
      search,
    } = req.query;

    const limit = 9;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * limit;

    const query = { status: "active" };

    if (minPrice) {
      query.price = { $gte: minPrice };
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: maxPrice };
    }

    if (minDate) {
      query.createdAt = { $gte: minDate };
    }

    if (maxDate) {
      query.createdAt = { ...query.createdAt, $lte: maxDate };
    }

    if (category) {
      query.category = category;
    }

    let sortQuery = { createdAt: -1 };

    if (sort === "asc") {
      sortQuery = { price: 1 };
    } else if (sort === "desc") {
      sortQuery = { price: -1 };
    }

    // if (search) {
    //   query = {

    //   };
    // }

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    //obtener el total de productos
    const totalProducts = await Product.countDocuments(query);

    //obtener el total de paginas
    const totalPages = Math.ceil(totalProducts / limit);

    const nextPage = currentPage + 1 <= totalPages ? currentPage + 1 : null;
    const previousPage = currentPage - 1 >= 1 ? currentPage - 1 : null;

    res.status(200).json({
      total: totalProducts,
      limit,
      page,
      totalPages,
      currentPage,
      nextPage,
      previousPage,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(9);

    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMostSales = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" })
      .sort({ totalSales: -1 })
      .limit(9);

    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMostViews = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" })
      .sort({ totalViews: -1 })
      .limit(9);

    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLatestProduct = async (req, res) => {
  try {
    //obtener el ultimo producto creado y que este activo
    const product = await Product.findOne({ status: "active" }).sort({
      createdAt: -1,
    });

    res.status(200).json({ product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSugerencias = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //buscar productos con la misma categoria exepto el producto actual
    const products = await Product.find({
      category: product.category,
      status: "active",
      _id: { $ne: id },
    }).limit(9);

    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      especifications,
      category,
      stock,
      status,
      categories,
      clasification,
    } = req.body;
    if (
      !title ||
      !price ||
      !description ||
      !especifications ||
      !category ||
      !stock
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //verificar si el producto ya existe en la base de datos con el mismo titulo
    const product = await Product.findOne({ title });
    if (product) {
      return res.status(400).json({ message: "Product already exists" });
    }
    const newProduct = new Product({
      title,
      price,
      description,
      especifications,
      category,
      stock,
      status: status ? status : "active",
      categories: categories ? categories : "Acción",
      clasification: clasification ? clasification : "T (Teen / Adolescentes)",
    });
    await newProduct.save();
    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      price,
      description,
      especifications,
      category,
      stock,
      status,
      categories,
      clasification,
      discount,
    } = req.body;

    console.log(req.body);

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.title = title ? title : product.title;
    product.price = price ? price : product.price;
    product.description = description ? description : product.description;
    product.especifications = especifications
      ? especifications
      : product.especifications;

    product.category = category ? category : product.category;
    product.stock = stock ? stock : product.stock;
    product.status = status ? status : product.status;
    product.categories = categories ? categories : product.categories;
    product.clasification = clasification
      ? clasification
      : product.clasification;

    product.discount = discount ? discount : product.discount;

    await product.save();

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.uploadUpdateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = "image" } = req.body;

    //obtener el producto por el id
    const product = await Product.findById(id);

    //verificar si el producto existe
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //checar que tipo es la imagen
    if (type === "image") {
      //verificar si el producto ya tiene una imagen
      if (product.image) {
        // obtener el public id de la imagen
        const nombreArr = product.image.split("/");
        const nombre = nombreArr[nombreArr.length - 1];
        const [public_id] = nombre.split(".");
        //eliminar la imagen de cloudinary
        await eliminarImagen(public_id);
      }

      //subir la imagen a cloudinary
      const image = await subirImagen(req.files.image.tempFilePath);

      //actualizar la imagen del producto
      product.image = image;

      //guardar el producto
      await product.save();

      //enviar respuesta
      return res.status(200).json({ message: "Image updated successfully" });
    }

    if (type === "gallery") {
      //subir la imagen a cloudinary
      const image = await subirImagen(req.files.image.tempFilePath);

      // actualizar el array de galery

      product.galery.push(image);

      //guardar el producto
      await product.save();

      //enviar respuesta

      return res
        .status(200)
        .json({ message: "Image updated successfully, to galery" });
    }

    if (type === "banner") {
      if (product.banner) {
        // obtener el public id de la bannern
        const nombreArr = product.banner.split("/");
        const nombre = nombreArr[nombreArr.length - 1];
        const [public_id] = nombre.split(".");
        //eliminar la imagen de cloudinary
        await eliminarImagen(public_id);
      }

      //subir la imagen a cloudinary
      const image = await subirImagen(req.files.image.tempFilePath);

      //actualizar la imagen del producto
      product.banner = image;

      //guardar el producto
      await product.save();

      //enviar respuesta
      return res.status(200).json({ message: "Banner updated successfully" });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.deleteImageForDb = async (req, res) => {
  try {
    const { id } = req.params;

    const { image } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(image);
    console.log(product.galery);

    //buscamos la imagen en el array de galeria
    const index = product.galery.indexOf(image);

    console.log(index);

    //si la imagen no existe en el array
    if (index === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    //obtenemos el public id de la imagen
    const nombreArr = image.split("/");
    const nombre = nombreArr[nombreArr.length - 1];
    const [public_id] = nombre.split(".");
    //eliminar la imagen de cloudinary
    await eliminarImagen(public_id);

    //eliminamos la imagen del array
    product.galery.splice(index, 1);

    //guardamos el producto
    await product.save();

    //enviamos respuesta
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    // console.log(product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      // console.log(product.image);
      //convertir la url de image en un string
      const imagStr = product.image.toString();

      const nombreArr = imagStr.split("/");
      const nombre = nombreArr[nombreArr.length - 1];
      const [public_id] = nombre.split(".");
      //eliminar la imagen de cloudinary
      await eliminarImagen(public_id);
    }

    if (product.banner) {
      const imagStr = product.banner.toString();
      const nombreArr = imagStr.split("/");
      const nombre = nombreArr[nombreArr.length - 1];
      const [public_id] = nombre.split(".");
      //eliminar la imagen de cloudinary
      await eliminarImagen(public_id);
    }

    if (product.galery.length > 0) {
      for (const image of product.galery) {
        const imagStr = image.toString();
        const nombreArr = imagStr.split("/");
        const nombre = nombreArr[nombreArr.length - 1];
        const [public_id] = nombre.split(".");
        //eliminar la imagen de cloudinary
        await eliminarImagen(public_id);
      }
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
