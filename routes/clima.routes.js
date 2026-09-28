import express from "express";
import multer from "multer";

import { obtenerClima } from "../controllers/clima.controller.js";

const router = express.Router();

router.get("/clima", obtenerClima);

export default router;
