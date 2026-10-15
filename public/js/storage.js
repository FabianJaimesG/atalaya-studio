// Único módulo que toca localStorage y sessionStorage. El resto del código usa estas
// funciones y no necesita saber cómo se guardan los datos.
//
// Todo va en try/catch: el almacenamiento puede estar lleno (~5 MB), bloqueado en
// modo privado o tener datos dañados. Si falla, la página sigue funcionando sin recordar.
// Nunca se guardan contraseñas, tokens ni datos sensibles: cualquier script de la página
// puede leer estos datos.

const PREFIJO = "atalaya:";

function leer(tipo, clave) {
  try {
    const texto = window[tipo].getItem(PREFIJO + clave);
    return texto === null ? null : JSON.parse(texto);
  } catch {
    return null;
  }
}

function escribir(tipo, clave, valor) {
  try {
    window[tipo].setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    // sin almacenamiento disponible
  }
}

function borrar(tipo, clave) {
  try {
    window[tipo].removeItem(PREFIJO + clave);
  } catch {
    // sin almacenamiento disponible
  }
}

// ---------- Preferencias (localStorage: persisten entre visitas) ----------

const PREFERENCIAS_POR_DEFECTO = { tema: null, nombre: "", ultimosServicios: [] };
const MAX_SERVICIOS_VISTOS = 3;

export function leerPreferencias() {
  const guardadas = leer("localStorage", "preferencias");
  const validas = guardadas && typeof guardadas === "object" ? guardadas : {};
  return { ...PREFERENCIAS_POR_DEFECTO, ...validas };
}

export function guardarPreferencias(cambios) {
  escribir("localStorage", "preferencias", { ...leerPreferencias(), ...cambios });
}

export function registrarServicioVisto(id) {
  const { ultimosServicios } = leerPreferencias();
  const otros = ultimosServicios.filter((visto) => visto !== id);
  guardarPreferencias({ ultimosServicios: [id, ...otros].slice(0, MAX_SERVICIOS_VISTOS) });
}

export function borrarDatosGuardados() {
  borrar("localStorage", "preferencias");
  borrar("localStorage", "cache:servicios");
  borrar("sessionStorage", "borrador");
}

// ---------- Caché de respuestas de la API (localStorage con vigencia) ----------

export function leerCache(clave, vigenciaMs) {
  const entrada = leer("localStorage", `cache:${clave}`);
  if (!entrada || Date.now() - entrada.guardado > vigenciaMs) return null;
  return entrada.datos;
}

export function guardarCache(clave, datos) {
  escribir("localStorage", `cache:${clave}`, { guardado: Date.now(), datos });
}

// ---------- Borrador del formulario (sessionStorage: solo esta pestaña) ----------

export function leerBorrador() {
  return leer("sessionStorage", "borrador") ?? {};
}

export function guardarBorrador(datos) {
  escribir("sessionStorage", "borrador", datos);
}

export function borrarBorrador() {
  borrar("sessionStorage", "borrador");
}
