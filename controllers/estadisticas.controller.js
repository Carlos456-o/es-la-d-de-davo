import db from "../firebase.js";

export const calcularEstadisticas = async () => {
  const snapshot = await db.collection("gatos").orderBy("fecha", "desc").get();

  const gatos = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (gatos.length === 0) {
    return {
      total: 0,
      promedioEdad: 0,
      promedioPeso: 0,
      edadMin: null,
      edadMax: null,
      pesoMin: null,
      pesoMax: null,
      porRaza: {},
      porMes: {},
      gatos,
    };
  }

  // Totales y promedios
  const total = gatos.length;
  const sumaEdad = gatos.reduce((acc, g) => acc + (Number(g.edad) || 0), 0);
  const sumaPeso = gatos.reduce((acc, g) => acc + (Number(g.peso) || 0), 0);

  const promedioEdad = Number((sumaEdad / total).toFixed(2));
  const promedioPeso = Number((sumaPeso / total).toFixed(2));

  // Mínimos y máximos
  const edades = gatos.map((g) => Number(g.edad) || 0);
  const pesos = gatos.map((g) => Number(g.peso) || 0);

  const edadMin = Math.min(...edades);
  const edadMax = Math.max(...edades);
  const pesoMin = Math.min(...pesos);
  const pesoMax = Math.max(...pesos);

  // Distribución por raza
  const porRaza = {};
  gatos.forEach((g) => {
    const raza = g.raza || "Sin raza";
    porRaza[raza] = (porRaza[raza] || 0) + 1;
  });

  // Distribución por mes de registro (YYYY-MM)
  const porMes = {};
  gatos.forEach((g) => {
    if (!g.fecha) return;
    const fecha = new Date(g.fecha);
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    porMes[mes] = (porMes[mes] || 0) + 1;
  });

  return {
    total,
    promedioEdad,
    promedioPeso,
    edadMin,
    edadMax,
    pesoMin,
    pesoMax,
    porRaza,
    porMes,
    gatos, // también devolvemos la lista completa por si se necesita
  };
};

export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await calcularEstadisticas();

    const { gatos, ...resumen } = stats;

    res.status(200).json({
      mensaje: "Estadísticas generadas correctamente",
      ...resumen,
      detalleRazas: Object.entries(stats.porRaza)
        .sort((a, b) => b[1] - a[1]) // ordenar de mayor a menor
        .map(([raza, cantidad]) => ({
          raza,
          cantidad,
          porcentaje: Number(((cantidad / stats.total) * 100).toFixed(1)),
        })),
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      mensaje: "Error al generar las estadísticas.",
      error: error.message,
    });
  }
};
