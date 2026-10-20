import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
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

export const exportarEstadisticasPDF = async (req, res) => {
  try {
    const stats = await calcularEstadisticas();

    // Crear el documento PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true, // necesario para escribir el pie de página en todas las páginas
      info: {
        Title: "Estadísticas de Gatos",
        Author: "Sistema de Gatos",
      },
    });

    // Configurar headers para la descarga
    const nombreArchivo = `estadisticas-gatos-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`
    );

    // Pipe el PDF directamente a la respuesta
    doc.pipe(res);

    // ========== ESTILOS Y COLORES ==========
    const colorPrincipal = "#4472C4";
    const colorSecundario = "#5B9BD5";
    const colorTexto = "#333333";

    // ========== TÍTULO ==========
    doc
      .fontSize(22)
      .fillColor(colorPrincipal)
      .font("Helvetica-Bold")
      .text("Estadísticas de Gatos", { align: "center" });

    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor("#666666")
      .font("Helvetica")
      .text(`Generado el: ${new Date().toLocaleString("es-ES")}`, {
        align: "center",
      });

    doc.moveDown(1.5);

    // ========== RESUMEN GENERAL ==========
    doc
      .fontSize(14)
      .fillColor(colorPrincipal)
      .font("Helvetica-Bold")
      .text("Resumen General");

    doc
      .moveTo(50, doc.y + 5)
      .lineTo(545, doc.y + 5)
      .strokeColor(colorPrincipal)
      .lineWidth(1.5)
      .stroke();

    doc.moveDown(0.8);

    const resumen = [
      ["Total de gatos", stats.total],
      ["Promedio de edad", `${stats.promedioEdad} años`],
      ["Promedio de peso", `${stats.promedioPeso} kg`],
      ["Edad mínima", stats.edadMin !== null ? `${stats.edadMin} años` : "—"],
      ["Edad máxima", stats.edadMax !== null ? `${stats.edadMax} años` : "—"],
      ["Peso mínimo", stats.pesoMin !== null ? `${stats.pesoMin} kg` : "—"],
      ["Peso máximo", stats.pesoMax !== null ? `${stats.pesoMax} kg` : "—"],
    ];

    resumen.forEach(([label, valor]) => {
      doc
        .fontSize(11)
        .fillColor(colorTexto)
        .font("Helvetica-Bold")
        .text(`${label}: `, { continued: true })
        .font("Helvetica")
        .text(String(valor));
      doc.moveDown(0.3);
    });

    doc.moveDown(1);

    // ========== DISTRIBUCIÓN POR RAZA ==========
    doc
      .fontSize(14)
      .fillColor(colorPrincipal)
      .font("Helvetica-Bold")
      .text("Distribución por Raza", 50);

    doc
      .moveTo(50, doc.y + 5)
      .lineTo(545, doc.y + 5)
      .strokeColor(colorPrincipal)
      .lineWidth(1.5)
      .stroke();

    doc.moveDown(0.8);

    if (Object.keys(stats.porRaza).length === 0) {
      doc.fontSize(11).fillColor("#666").text("No hay datos de razas.");
    } else {
      // Encabezado de tabla
      const startY = doc.y;
      doc.rect(50, startY, 495, 22).fill(colorSecundario);

      doc
        .fontSize(10)
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .text("Raza", 60, startY + 6)
        .text("Cantidad", 300, startY + 6)
        .text("Porcentaje", 420, startY + 6);

      let y = startY + 28;

      // Filas
      const razasOrdenadas = Object.entries(stats.porRaza).sort(
        (a, b) => b[1] - a[1]
      );

      razasOrdenadas.forEach(([raza, cantidad], index) => {
        const porcentaje =
          stats.total > 0
            ? ((cantidad / stats.total) * 100).toFixed(1)
            : "0.0";

        // Salto de página si la fila no cabe
        if (y + 20 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        // Fondo alternado
        if (index % 2 === 0) {
          doc.rect(50, y - 4, 495, 20).fill("#F2F2F2");
        }

        // Todas las columnas usan la misma "y" para quedar alineadas
        doc
          .fillColor(colorTexto)
          .font("Helvetica")
          .fontSize(10)
          .text(raza, 60, y, { width: 230 })
          .text(String(cantidad), 300, y)
          .text(`${porcentaje}%`, 420, y);

        y += 20;
      });

      doc.x = 50;
      doc.y = y;
    }

    doc.moveDown(1.2);

    // ========== REGISTROS POR MES ==========
    doc
      .fontSize(14)
      .fillColor(colorPrincipal)
      .font("Helvetica-Bold")
      .text("Gatos registrados por mes", 50);

    doc
      .moveTo(50, doc.y + 5)
      .lineTo(545, doc.y + 5)
      .strokeColor(colorPrincipal)
      .lineWidth(1.5)
      .stroke();

    doc.moveDown(0.8);

    if (Object.keys(stats.porMes).length === 0) {
      doc.fontSize(11).fillColor("#666").text("No hay datos por mes.");
    } else {
      const mesesOrdenados = Object.entries(stats.porMes).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      mesesOrdenados.forEach(([mes, cantidad]) => {
        doc
          .fontSize(11)
          .fillColor(colorTexto)
          .font("Helvetica-Bold")
          .text(`${mes}: `, { continued: true })
          .font("Helvetica")
          .text(`${cantidad} gato(s)`);
        doc.moveDown(0.3);
      });
    }

    // ========== PIE DE PÁGINA ==========
    const rangoPaginas = doc.bufferedPageRange();
    for (let i = 0; i < rangoPaginas.count; i++) {
      doc.switchToPage(rangoPaginas.start + i);

      // Quitar el margen inferior para que el pie no cree una página nueva
      const margenInferior = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      doc
        .fontSize(8)
        .fillColor("#999999")
        .text(
          `Página ${i + 1} de ${rangoPaginas.count}  |  Sistema de Gatos`,
          50,
          doc.page.height - 40,
          { align: "center", width: 495 }
        );

      doc.page.margins.bottom = margenInferior;
    }

    // Finalizar el documento
    doc.end();
  } catch (error) {
    console.error("Error al generar PDF:", error);
    // Si ya se enviaron headers, no se puede enviar JSON
    if (!res.headersSent) {
      res.status(500).json({
        mensaje: "Error al generar el archivo PDF.",
        error: error.message,
      });
    }
  }
};
