import db from "../firebase.js";
import supabase from "../supabase.js";

export const registrarGato = async (req, res) => {
  try {
    const { nombre, edad, peso, raza } = req.body || {};
    const imagen = req.file;

    if (!nombre || !edad || !peso || !raza) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios: nombre, edad, peso y raza.",
      });
    }

    if (!imagen) {
      return res.status(400).json({
        mensaje: "La imagen del gato es obligatoria.",
      });
    }

    if (!imagen.mimetype.startsWith("image/")) {
      return res.status(400).json({
        mensaje: "El archivo debe ser una imagen.",
      });
    }

    const extension = imagen.originalname.split(".").pop().toLowerCase();

    const nombreArchivo = `gato-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const rutaImagen = `gatos/${nombreArchivo}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes_gatos")
      .upload(rutaImagen, imagen.buffer, {
        contentType: imagen.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error al subir imagen:", uploadError);

      return res.status(500).json({
        mensaje: "Error al subir la imagen a Supabase.",
        error: uploadError.message,
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from("imagenes_gatos")
      .getPublicUrl(rutaImagen);

    const imagenUrl = publicUrlData.publicUrl;

    const docRef = await db.collection("gatos").add({
      nombre,
      edad: Number(edad),
      peso: Number(peso),
      raza,
      imagenUrl,
      fecha: new Date().toISOString(),
    });

    res.status(201).json({
      mensaje: `¡Gato registrado con éxito! ID: ${docRef.id} | Nombre: ${nombre} | Edad: ${edad} años | Peso: ${peso} kg | Raza: ${raza}`,
      id: docRef.id,
      imagenUrl,
    });

  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      mensaje: "Error al registrar el gato.",
      error: error.message,
    });
  }
};
