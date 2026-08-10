// Controlador de gatos
export const registrarGato = (req, res) => {
  const { nombre, edad, peso, raza } = req.body;

  // Validación básica
  if (!nombre || !edad || !peso || !raza) {
    return res.status(400).json({
    mensaje: "Todos los campos son obligatorios: nombre, edad, peso y raza."
    });
  }

  // Mensaje unificado
  const mensaje = `¡Gato registrado con éxito! 
Nombre: ${nombre} | Edad: ${edad} años | Peso: ${peso} kg | Raza: ${raza}`;

  res.json({ mensaje });
};
