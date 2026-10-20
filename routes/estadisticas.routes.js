import express from "express";
import { obtenerEstadisticas } from "../controllers/estadisticas.controller.js";
import {
  exportarEstadisticasExcel,
  exportarEstadisticasPDF,
  exportarGatosCSV,
} from "../controllers/exportacion.controller.js";
import { capturarInfoSolicitud } from "../middlewares/auditoria.js";

const router = express.Router();

router.use(capturarInfoSolicitud);

// Estadísticas en JSON
router.get("/estadisticas", obtenerEstadisticas);

// Descarga el archivo Excel
router.get("/estadisticas/excel", exportarEstadisticasExcel);

// Descarga el archivo PDF
router.get("/estadisticas/pdf", exportarEstadisticasPDF);

// Descarga el listado de gatos en CSV
router.get("/estadisticas/csv", exportarGatosCSV);

export default router;
