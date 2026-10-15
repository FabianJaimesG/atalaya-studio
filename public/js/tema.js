// Botón de modo oscuro. El tema inicial ya lo aplicó tema-inicial.js en el <head>.
import { guardarPreferencias } from "./storage.js";

export function iniciarTema(boton) {
  const raiz = document.documentElement;

  const aplicar = (tema) => {
    raiz.dataset.tema = tema;
    boton.setAttribute("aria-pressed", String(tema === "oscuro"));
  };

  aplicar(raiz.dataset.tema === "oscuro" ? "oscuro" : "claro");

  boton.addEventListener("click", () => {
    const nuevo = raiz.dataset.tema === "oscuro" ? "claro" : "oscuro";
    aplicar(nuevo);
    guardarPreferencias({ tema: nuevo });
  });
}
