// middlewares/auditoria.js
export const capturarInfoSolicitud = (req, res, next) => {
  // IP real (funciona detrás de proxy / Render / Railway / Vercel, etc.)
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress ||
    req.ip ||
    "desconocida";

  req.auditoria = {
    ip,
    userAgent: req.headers["user-agent"] || "desconocido",
    metodo: req.method,
    ruta: req.originalUrl || req.url,
  };

  next();
};
