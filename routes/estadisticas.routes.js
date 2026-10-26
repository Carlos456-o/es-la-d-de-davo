import express from "express";
import { obtenerEstadisticas } from "../controllers/estadisticas.controller.js";
import {
  exportarEstadisticasExcel,
  exportarEstadisticasPDF,
  exportarGatosCSV,
  exportarGatosLista,
  exportarGatosJSON,
  exportarGatosSQL,
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

// Listado de gatos en texto plano
router.get("/lista", exportarGatosLista);

// Colección de gatos en JSON
router.get("/json", exportarGatosJSON);

// Script SQL con CREATE TABLE e INSERTs
router.get("/sql", exportarGatosSQL);

export default router;
