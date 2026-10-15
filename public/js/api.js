// Único módulo que habla con el servidor.
import { API_URL } from "./config.js";
import { guardarCache, leerCache } from "./storage.js";

const TIEMPO_MAXIMO_MS = 10_000;
const VIGENCIA_SERVICIOS_MS = 60 * 60 * 1000; // una hora

async function pedirJSON(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
  } catch {
    throw new Error("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(datos.error || "El servidor respondió con un error. Inténtalo más tarde.");
    error.campos = datos.campos;
    throw error;
  }
  return datos;
}

// Los servicios cambian poco: se guardan en caché para no pedirlos en cada visita.
export async function obtenerServicios() {
  const enCache = leerCache("servicios", VIGENCIA_SERVICIOS_MS);
  if (enCache) return enCache;

  const servicios = await pedirJSON("/api/servicios");
  guardarCache("servicios", servicios);
  return servicios;
}

export function obtenerTestimonios() {
  return pedirJSON("/api/testimonios");
}

export function enviarContacto(datos) {
  return pedirJSON("/api/contacto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
}
