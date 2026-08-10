import express from "express";
import cors from "cors";  //Para que el frontend pueda llamar
import gatoRoutes from "./routes/gato.routes.js";
const app = express();

// Middlewares
app.use(cors());  //Permite peticiones desde cualquier origen
app.use(express.json());

// Rutas
app.use(gatoRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no registrada." });
});

export default app;
