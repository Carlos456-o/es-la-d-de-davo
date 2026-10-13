import express from "express";
import multer from "multer";
import {
  registrarGato,
  obtenerGatos,
  actualizarGato,
  eliminarGato,
  buscarGatos,
  enviarGatosPorEmail,
} from "../controllers/gato.controller.js";
import { capturarInfoSolicitud } from "../middlewares/auditoria.js";

const router = express.Router();

router.use(capturarInfoSolicitud); // aplica a todas las rutas de este router

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/gato",
  upload.single("imagen"),
  registrarGato
);

router.put(
  "/gato/:id",
  upload.single("imagen"), // la imagen es opcional
  actualizarGato
);

router.get("/gatos", obtenerGatos);

router.get("/gatos/buscar", buscarGatos);

router.get("/gatos/enviar-email", enviarGatosPorEmail);

router.delete("/gato/:id", eliminarGato);

export default router;