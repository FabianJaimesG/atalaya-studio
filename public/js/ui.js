// Pinta los datos en la página. Nunca usa innerHTML con datos externos: todo el texto
// entra con textContent, así un "<script>" llegado de la API se muestra como texto (XSS).

function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

export function mostrarEstado(contenedor, texto, tipo = "info") {
  contenedor.dataset.tipo = tipo;
  contenedor.textContent = texto;
}

export function mostrarError(contenedor, texto, alReintentar) {
  mostrarEstado(contenedor, texto, "error");
  const boton = crear("button", "boton boton--secundario", "Reintentar");
  boton.type = "button";
  boton.addEventListener("click", alReintentar, { once: true });
  contenedor.append(document.createElement("br"), boton);
}

export function limpiarEstado(contenedor) {
  contenedor.textContent = "";
  delete contenedor.dataset.tipo;
}

// Las tarjetas se arman en un DocumentFragment (en memoria) y se insertan de una sola vez,
// para que el navegador no recalcule la página por cada elemento.
export function renderServicios(lista, servicios, alVer) {
  const fragmento = document.createDocumentFragment();

  for (const servicio of servicios) {
    const tarjeta = crear("li", "tarjeta");
    tarjeta.id = `servicio-${servicio.id}`;

    const detalle = crear("p", "tarjeta__detalle", servicio.detalle);
    detalle.id = `detalle-${servicio.id}`;
    detalle.hidden = true;

    const boton = crear("button", "boton boton--secundario", "Ver detalle");
    boton.type = "button";
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-controls", detalle.id);
    boton.addEventListener("click", () => {
      const abrir = detalle.hidden;
      detalle.hidden = !abrir;
      boton.setAttribute("aria-expanded", String(abrir));
      boton.textContent = abrir ? "Ocultar detalle" : "Ver detalle";
      if (abrir) alVer(servicio);
    });

    tarjeta.append(
      crear("h3", "tarjeta__titulo", servicio.nombre),
      crear("p", "tarjeta__resumen", servicio.resumen),
      detalle,
      boton,
    );
    fragmento.append(tarjeta);
  }

  lista.replaceChildren(fragmento);
}

export function renderTestimonios(lista, testimonios) {
  const fragmento = document.createDocumentFragment();

  for (const { autor, cargo, texto } of testimonios) {
    const item = crear("li", "tarjeta");
    const cita = crear("blockquote", "testimonio");
    const pie = crear("footer");
    pie.append(crear("cite", "", autor), crear("span", "", cargo));
    cita.append(crear("p", "", texto), pie);
    item.append(cita);
    fragmento.append(item);
  }

  lista.replaceChildren(fragmento);
}

export function renderVistos(seccion, lista, servicios, idsVistos) {
  const vistos = idsVistos
    .map((id) => servicios.find((servicio) => servicio.id === id))
    .filter(Boolean);

  seccion.hidden = vistos.length === 0;
  lista.replaceChildren(
    ...vistos.map((servicio) => {
      const item = crear("li");
      const enlace = crear("a", "", servicio.nombre);
      enlace.href = `#servicio-${servicio.id}`;
      item.append(enlace);
      return item;
    }),
  );
}

export function mostrarSaludo(elemento, nombre) {
  elemento.hidden = !nombre;
  elemento.textContent = nombre ? `¡Hola de nuevo, ${nombre}!` : "";
}
