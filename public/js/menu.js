// Menú adaptable para móvil y resaltado de la sección que se está viendo.

export function iniciarMenu(boton, menu) {
  const estaAbierto = () => boton.getAttribute("aria-expanded") === "true";

  const cambiar = (abrir) => {
    boton.setAttribute("aria-expanded", String(abrir));
    menu.classList.toggle("abierto", abrir);
  };

  boton.addEventListener("click", () => cambiar(!estaAbierto()));

  // Al elegir una sección, el menú se cierra para dejar ver el contenido.
  menu.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) cambiar(false);
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && estaAbierto()) {
      cambiar(false);
      boton.focus();
    }
  });
}

export function resaltarSeccionActiva(enlaces) {
  if (!("IntersectionObserver" in window)) return;

  const porId = new Map(enlaces.map((enlace) => [enlace.hash.slice(1), enlace]));
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        const enlace = porId.get(entrada.target.id);
        if (entrada.isIntersecting) {
          enlaces.forEach((otro) => otro.removeAttribute("aria-current"));
          enlace.setAttribute("aria-current", "location");
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );

  for (const id of porId.keys()) {
    const seccion = document.getElementById(id);
    if (seccion) observador.observe(seccion);
  }
}
