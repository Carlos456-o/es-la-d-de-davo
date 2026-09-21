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

export const obtenerGatos = async (req, res) => {
  try {
    const snapshot = await db.collection("gatos").orderBy("fecha", "desc").get();

    const gatos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(gatos);
  } catch (error) {
    console.error("Error al obtener gatos:", error);
    res.status(500).json({
      mensaje: "Error al obtener los gatos.",
      error: error.message,
    });
  }
};

export const actualizarGato = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, edad, peso, raza } = req.body || {};
    const imagen = req.file;

    if (!nombre || !edad || !peso || !raza) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios: nombre, edad, peso y raza.",
      });
    }

    const docRef = db.collection("gatos").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        mensaje: "Gato no encontrado.",
      });
    }

    let imagenUrl = doc.data().imagenUrl; // mantener la imagen actual por defecto

    // Si se subió una nueva imagen, la actualizamos
    if (imagen) {
      if (!imagen.mimetype.startsWith("image/")) {
        return res.status(400).json({
          mensaje: "El archivo debe ser una imagen.",
        });
      }

      const extension = imagen.originalname.split(".").pop().toLowerCase();
      const nombreArchivo = `gato-${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
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

      imagenUrl = publicUrlData.publicUrl;
    }

    await docRef.update({
      nombre,
      edad: Number(edad),
      peso: Number(peso),
      raza,
      imagenUrl,
    });

    res.status(200).json({
      mensaje: `¡Gato actualizado con éxito! ID: ${id} | Nombre: ${nombre}`,
      id,
      imagenUrl,
    });
  } catch (error) {
    console.error("Error al actualizar gato:", error);
    res.status(500).json({
      mensaje: "Error al actualizar el gato.",
      error: error.message,
    });
  }
};
