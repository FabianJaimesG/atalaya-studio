// Script clásico (no módulo) que se carga en el <head> y se ejecuta antes de pintar
// la página: aplica el tema guardado para evitar el destello de modo claro.
(function () {
  var raiz = document.documentElement;
  raiz.classList.add("js");

  var tema = null;
  try {
    tema = JSON.parse(localStorage.getItem("atalaya:preferencias") || "{}").tema;
  } catch (error) {
    // almacenamiento bloqueado o dañado: se usa la preferencia del sistema
  }
  if (tema !== "oscuro" && tema !== "claro") {
    tema = window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
  }
  raiz.dataset.tema = tema;
})();
