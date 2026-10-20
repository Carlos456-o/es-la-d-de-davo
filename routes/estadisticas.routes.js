import express from "express";
import { obtenerEstadisticas } from "../controllers/estadisticas.controller.js";
import {
  exportarEstadisticasExcel,
  exportarEstadisticasPDF,
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

export default router;
