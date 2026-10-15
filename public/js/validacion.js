// Reglas del formulario de contacto. Este módulo no depende del navegador ni de
// Node: lo usan el frontend (validación inmediata) y el servidor (validación real).

export const LIMITES = { nombre: 80, correo: 120, mensaje: 1000, mensajeMinimo: 10 };

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function limpiarContacto(datos) {
  const fuente = datos && typeof datos === "object" ? datos : {};
  return {
    nombre: String(fuente.nombre ?? "").trim(),
    correo: String(fuente.correo ?? "").trim(),
    mensaje: String(fuente.mensaje ?? "").trim(),
  };
}

// Devuelve un objeto { campo: "mensaje de error" }. Vacío significa que todo está bien.
export function validarContacto(datos) {
  const { nombre, correo, mensaje } = limpiarContacto(datos);
  const errores = {};

  if (!nombre) errores.nombre = "Escribe tu nombre.";
  else if (nombre.length > LIMITES.nombre) errores.nombre = `Usa como máximo ${LIMITES.nombre} caracteres.`;

  if (!correo) errores.correo = "Escribe tu correo electrónico.";
  else if (correo.length > LIMITES.correo || !PATRON_CORREO.test(correo)) {
    errores.correo = "Escribe un correo válido, por ejemplo nombre@dominio.com.";
  }

  if (mensaje.length < LIMITES.mensajeMinimo) {
    errores.mensaje = `Cuéntanos un poco más (mínimo ${LIMITES.mensajeMinimo} caracteres).`;
  } else if (mensaje.length > LIMITES.mensaje) {
    errores.mensaje = `Usa como máximo ${LIMITES.mensaje} caracteres.`;
  }

  return errores;
}
