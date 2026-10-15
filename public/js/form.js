// Formulario de contacto: validación inmediata, borrador en sessionStorage,
// envío a la API y confirmación visual.
import { enviarContacto } from "./api.js";
import {
  borrarBorrador,
  guardarBorrador,
  guardarPreferencias,
  leerBorrador,
  leerPreferencias,
} from "./storage.js";
import { mostrarEstado } from "./ui.js";
import { validarContacto } from "./validacion.js";

const CAMPOS = ["nombre", "correo", "mensaje"];

function leerCampos(form) {
  return Object.fromEntries(CAMPOS.map((campo) => [campo, form.elements[campo].value]));
}

function pintarErrores(form, errores, campos = CAMPOS) {
  for (const campo of campos) {
    const mensaje = errores[campo] ?? "";
    form.querySelector(`#error-${campo}`).textContent = mensaje;
    form.elements[campo].setAttribute("aria-invalid", String(Boolean(mensaje)));
  }
}

export function iniciarFormulario(form, { alEnviar } = {}) {
  const boton = form.querySelector('[type="submit"]');
  const estado = form.querySelector("#form-estado");
  const recordar = form.elements.recordar;

  // Restaura el borrador de esta pestaña y el nombre recordado.
  const borrador = leerBorrador();
  for (const campo of CAMPOS) {
    if (borrador[campo]) form.elements[campo].value = borrador[campo];
  }
  const { nombre } = leerPreferencias();
  if (nombre) {
    recordar.checked = true;
    if (!form.elements.nombre.value) form.elements.nombre.value = nombre;
  }

  form.addEventListener("input", (evento) => {
    guardarBorrador(leerCampos(form));
    // Si el campo ya mostraba un error, se revalida mientras el usuario corrige.
    if (evento.target.getAttribute("aria-invalid") === "true") {
      pintarErrores(form, validarContacto(leerCampos(form)), [evento.target.name]);
    }
  });

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const datos = leerCampos(form);

    const errores = validarContacto(datos);
    pintarErrores(form, errores);
    const primerError = CAMPOS.find((campo) => errores[campo]);
    if (primerError) {
      mostrarEstado(estado, "Revisa los campos marcados.", "error");
      form.elements[primerError].focus();
      return;
    }

    // Se bloquea el botón para que un doble clic no envíe el mensaje dos veces.
    boton.disabled = true;
    boton.classList.add("cargando");
    mostrarEstado(estado, "Enviando tu mensaje…");

    try {
      const respuesta = await enviarContacto(datos);
      const nombreLimpio = datos.nombre.trim();
      const recordarNombre = recordar.checked;
      guardarPreferencias({ nombre: recordarNombre ? nombreLimpio : "" });
      form.reset();
      borrarBorrador();
      if (recordarNombre) {
        form.elements.nombre.value = nombreLimpio;
        recordar.checked = true;
      }
      mostrarEstado(estado, respuesta.mensaje, "exito");
      alEnviar?.();
    } catch (error) {
      if (error.campos) pintarErrores(form, error.campos);
      mostrarEstado(estado, error.message, "error");
    } finally {
      boton.disabled = false;
      boton.classList.remove("cargando");
    }
  });
}
