const cloudinary = require("cloudinary").v2;

const config = {
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
};

const subirImagen = async (archivo) => {
  try {
    cloudinary.config(config);
    const result = await cloudinary.uploader.upload(archivo);
    return result.secure_url;
  } catch (error) {
    console.log(error);
  }
};

const eliminarImagen = async (public_id) => {
  try {
    cloudinary.config(config);
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { subirImagen, eliminarImagen };
