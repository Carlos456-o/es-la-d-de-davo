import ExcelJS from "exceljs";
import { calcularEstadisticas } from "./estadisticas.controller.js";

export const exportarEstadisticasExcel = async (req, res) => {
  try {
    const stats = await calcularEstadisticas();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistema de Gatos";
    workbook.created = new Date();

    // ======================
    // HOJA 1: Resumen
    // ======================
    const hojaResumen = workbook.addWorksheet("Resumen", {
      properties: { tabColor: { argb: "FF4472C4" } },
    });

    // Estilos
    const estiloTitulo = {
      font: { bold: true, size: 16, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };

    const estiloEncabezado = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF5B9BD5" } },
      alignment: { horizontal: "center" },
    };

    const estiloLabel = {
      font: { bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD6EAF8" } },
    };

    // Título
    hojaResumen.mergeCells("A1:B1");
    hojaResumen.getCell("A1").value = "📊 ESTADÍSTICAS DE GATOS";
    hojaResumen.getCell("A1").style = estiloTitulo;
    hojaResumen.getRow(1).height = 30;

    // Datos resumen
    const datosResumen = [
      ["Total de gatos", stats.total],
      ["Promedio de edad (años)", stats.promedioEdad],
      ["Promedio de peso (kg)", stats.promedioPeso],
      ["Edad mínima", stats.edadMin ?? "—"],
      ["Edad máxima", stats.edadMax ?? "—"],
      ["Peso mínimo (kg)", stats.pesoMin ?? "—"],
      ["Peso máximo (kg)", stats.pesoMax ?? "—"],
      ["Fecha de generación", new Date().toLocaleString("es-ES")],
    ];

    hojaResumen.addRow([]); // fila vacía
    hojaResumen.addRow(["Métrica", "Valor"]).eachCell((cell) => {
      cell.style = estiloEncabezado;
    });

    datosResumen.forEach(([label, valor]) => {
      const row = hojaResumen.addRow([label, valor]);
      row.getCell(1).style = estiloLabel;
    });

    // Ajustar anchos
    hojaResumen.getColumn(1).width = 28;
    hojaResumen.getColumn(2).width = 20;

    // ======================
    // HOJA 2: Distribución por Raza
    // ======================
    const hojaRazas = workbook.addWorksheet("Por Raza", {
      properties: { tabColor: { argb: "FF70AD47" } },
    });

    hojaRazas.mergeCells("A1:C1");
    hojaRazas.getCell("A1").value = "Distribución por Raza";
    hojaRazas.getCell("A1").style = {
      ...estiloTitulo,
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF70AD47" } },
    };
    hojaRazas.getRow(1).height = 28;

    hojaRazas.addRow([]);
    hojaRazas.addRow(["Raza", "Cantidad", "Porcentaje (%)"]).eachCell((cell) => {
      cell.style = {
        ...estiloEncabezado,
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF70AD47" } },
      };
    });

    Object.entries(stats.porRaza)
      .sort((a, b) => b[1] - a[1]) // ordenar de mayor a menor
      .forEach(([raza, cantidad]) => {
        const porcentaje = stats.total > 0
          ? Number(((cantidad / stats.total) * 100).toFixed(1))
          : 0;
        hojaRazas.addRow([raza, cantidad, porcentaje]);
      });

    hojaRazas.getColumn(1).width = 25;
    hojaRazas.getColumn(2).width = 12;
    hojaRazas.getColumn(3).width = 16;

    // ======================
    // HOJA 3: Registros por Mes
    // ======================
    const hojaMeses = workbook.addWorksheet("Por Mes", {
      properties: { tabColor: { argb: "FFED7D31" } },
    });

    hojaMeses.mergeCells("A1:B1");
    hojaMeses.getCell("A1").value = "Gatos registrados por mes";
    hojaMeses.getCell("A1").style = {
      ...estiloTitulo,
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFED7D31" } },
    };
    hojaMeses.getRow(1).height = 28;

    hojaMeses.addRow([]);
    hojaMeses.addRow(["Mes (YYYY-MM)", "Cantidad"]).eachCell((cell) => {
      cell.style = {
        ...estiloEncabezado,
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFED7D31" } },
      };
    });

    Object.entries(stats.porMes)
      .sort((a, b) => a[0].localeCompare(b[0])) // orden cronológico
      .forEach(([mes, cantidad]) => {
        hojaMeses.addRow([mes, cantidad]);
      });

    hojaMeses.getColumn(1).width = 18;
    hojaMeses.getColumn(2).width = 12;

    // ======================
    // HOJA 4: Listado completo de gatos
    // ======================
    const hojaGatos = workbook.addWorksheet("Listado de Gatos", {
      properties: { tabColor: { argb: "FF7030A0" } },
    });

    hojaGatos.mergeCells("A1:F1");
    hojaGatos.getCell("A1").value = "Listado completo de gatos";
    hojaGatos.getCell("A1").style = {
      ...estiloTitulo,
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF7030A0" } },
    };
    hojaGatos.getRow(1).height = 28;

    hojaGatos.addRow([]);
    const headers = ["ID", "Nombre", "Edad", "Peso (kg)", "Raza", "Fecha de registro"];
    hojaGatos.addRow(headers).eachCell((cell) => {
      cell.style = {
        ...estiloEncabezado,
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF7030A0" } },
      };
    });

    stats.gatos.forEach((g) => {
      hojaGatos.addRow([
        g.id,
        g.nombre,
        g.edad,
        g.peso,
        g.raza,
        g.fecha ? new Date(g.fecha).toLocaleString("es-ES") : "—",
      ]);
    });

    // Anchos de columnas
    hojaGatos.getColumn(1).width = 28;
    hojaGatos.getColumn(2).width = 18;
    hojaGatos.getColumn(3).width = 10;
    hojaGatos.getColumn(4).width = 12;
    hojaGatos.getColumn(5).width = 18;
    hojaGatos.getColumn(6).width = 22;

    // ======================
    // Enviar el archivo
    // ======================
    const nombreArchivo = `estadisticas-gatos-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al generar Excel:", error);
    res.status(500).json({
      mensaje: "Error al generar el archivo Excel.",
      error: error.message,
    });
  }
};
