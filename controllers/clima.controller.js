import db from "../firebase.js";
import supabase from "../supabase.js";

export const obtenerClima = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        mensaje: "Se requieren los parámetros lat y lon.",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        mensaje: "lat y lon deben ser números válidos.",
      });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability&forecast_hours=12&timezone=auto`;

    const respuesta = await fetch(url);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      return res.status(500).json({
        mensaje: "Error al obtener el clima de Open-Meteo.",
        error: data.reason || "Error desconocido",
      });
    }

    // Formatear solo las próximas 12 horas
    const pronostico = data.hourly.time.map((hora, index) => ({
      hora,
      temperatura: data.hourly.temperature_2m[index],
      probabilidadLluvia: data.hourly.precipitation_probability[index],
    }));

    res.status(200).json({
      ubicacion: {
        latitud: latitude,
        longitud: longitude,
      },
      pronostico, // array de 12 horas
    });
  } catch (error) {
    console.error("Error en obtenerClima:", error);
    res.status(500).json({
      mensaje: "Error al obtener el pronóstico del clima.",
      error: error.message,
    });
  }
};
