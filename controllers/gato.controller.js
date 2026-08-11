import db from "../firebase.js";

export const registrarGato = async (req, res) => {
  try {
    const { nombre, edad, peso, raza } = req.body;

    if (!nombre || !edad || !peso || !raza) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios: nombre, edad, peso y raza.",
      });
    }

    // Si la colección "gatos" no existe, Firestore la crea automáticamente
    const docRef = await db.collection("gatos").add({
      nombre,
      edad: Number(edad),
      peso: Number(peso),
      raza,
      fecha: new Date().toISOString(),
    });

    const mensaje = `¡Gato registrado con éxito en Firebase! 
ID: ${docRef.id} | Nombre: ${nombre} | Edad: ${edad} años | Peso: ${peso} kg | Raza: ${raza}`;

    res.json({ mensaje });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al guardar en Firebase: " + error.message,
    });
  }
};
