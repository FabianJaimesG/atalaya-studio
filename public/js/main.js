// Punto de entrada: conecta los módulos y coordina el flujo de la página.
import { obtenerServicios, obtenerTestimonios } from "./api.js";
import { iniciarFormulario } from "./form.js";
import { iniciarMenu, resaltarSeccionActiva } from "./menu.js";
import { borrarDatosGuardados, leerPreferencias, registrarServicioVisto } from "./storage.js";
import { iniciarTema } from "./tema.js";
import {
  limpiarEstado,
  mostrarError,
  mostrarEstado,
  mostrarSaludo,
  renderServicios,
  renderTestimonios,
  renderVistos,
} from "./ui.js";

const $ = (selector) => document.querySelector(selector);

let servicios = [];

function actualizarSaludo() {
  mostrarSaludo($("#saludo"), leerPreferencias().nombre);
}

function actualizarVistos() {
  renderVistos($("#vistos"), $("#lista-vistos"), servicios, leerPreferencias().ultimosServicios);
}

async function cargarServicios() {
  const estado = $("#servicios-estado");
  mostrarEstado(estado, "Cargando servicios…");
  try {
    servicios = await obtenerServicios();
    renderServicios($("#lista-servicios"), servicios, (servicio) => {
      registrarServicioVisto(servicio.id);
      actualizarVistos();
    });
    limpiarEstado(estado);
    actualizarVistos();
  } catch (error) {
    mostrarError(estado, error.message, cargarServicios);
  }
}

async function cargarTestimonios() {
  const estado = $("#testimonios-estado");
  mostrarEstado(estado, "Cargando testimonios…");
  try {
    renderTestimonios($("#lista-testimonios"), await obtenerTestimonios());
    limpiarEstado(estado);
  } catch (error) {
    mostrarError(estado, error.message, cargarTestimonios);
  }
}

iniciarTema($("#boton-tema"));
iniciarMenu($("#boton-menu"), $("#menu"));
resaltarSeccionActiva([...document.querySelectorAll(".nav__lista a")]);
iniciarFormulario($("#form-contacto"), { alEnviar: actualizarSaludo });
actualizarSaludo();
cargarServicios();
cargarTestimonios();

$("#borrar-preferencias").addEventListener("click", () => {
  borrarDatosGuardados();
  actualizarSaludo();
  actualizarVistos();
  $("#form-contacto").elements.recordar.checked = false;
  mostrarEstado($("#pie-estado"), "Listo: borramos el tema, tu nombre y los servicios vistos de este navegador.", "exito");
});
