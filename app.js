import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { servicios, testimonios } from "./data/contenido.js";
import { limpiarContacto, validarContacto } from "./public/js/validacion.js";

const CARPETA_PUBLICA = fileURLToPath(new URL("./public", import.meta.url));

const CABECERAS_SEGURIDAD = {
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

// Limita cuántos mensajes puede enviar una misma IP en una ventana de tiempo.
function limitarEnvios({ maximo, ventanaMs }) {
  const envios = new Map();
  return (req, res, next) => {
    const ahora = Date.now();
    const recientes = (envios.get(req.ip) ?? []).filter((t) => ahora - t < ventanaMs);
    if (recientes.length >= maximo) {
      return res
        .status(429)
        .json({ error: "Has enviado varios mensajes seguidos. Espera unos minutos e inténtalo de nuevo." });
    }
    recientes.push(ahora);
    envios.set(req.ip, recientes);
    next();
  };
}

export function crearApp({
  origenesPermitidos = [],
  limiteEnvios = { maximo: 5, ventanaMs: 10 * 60 * 1000 },
} = {}) {
  const app = express();
  const mensajes = []; // sin base de datos por ahora: se pierden al reiniciar

  app.disable("x-powered-by");
  app.set("trust proxy", 1); // Render y Netlify ponen un proxy delante

  app.use((req, res, next) => {
    res.set(CABECERAS_SEGURIDAD);
    next();
  });

  // CORS solo hace falta si el frontend se publica en otro dominio (p. ej. Netlify).
  if (origenesPermitidos.length > 0) {
    app.use("/api", cors({ origin: origenesPermitidos }));
  }
  app.use(express.json({ limit: "10kb" }));

  app.get("/api/salud", (req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/servicios", (req, res) => {
    res.json(servicios);
  });

  app.get("/api/testimonios", (req, res) => {
    res.json(testimonios);
  });

  app.post("/api/contacto", limitarEnvios(limiteEnvios), (req, res) => {
    const errores = validarContacto(req.body);
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ error: "Revisa los campos marcados.", campos: errores });
    }
    const datos = limpiarContacto(req.body);
    mensajes.push({ ...datos, fecha: new Date().toISOString() });
    console.log(`Mensaje de contacto recibido (${mensajes.length} en total)`);
    res.status(201).json({ ok: true, mensaje: `¡Gracias, ${datos.nombre}! Te responderemos en menos de 48 horas.` });
  });

  app.use("/api", (req, res) => {
    res.status(404).json({ error: "Recurso no encontrado." });
  });

  app.use(express.static(CARPETA_PUBLICA));

  app.use((err, req, res, next) => {
    const estado = err.status ?? err.statusCode ?? 500;
    if (estado >= 500) console.error(err);
    const errores = {
      400: "La solicitud no tiene un formato válido.",
      413: "El mensaje es demasiado largo.",
    };
    res.status(estado).json({ error: errores[estado] ?? "Ocurrió un error en el servidor." });
  });

  return app;
}
