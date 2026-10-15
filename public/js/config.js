// La URL de la API se configura en el HTML (<meta name="api-url">), no en el código.
// Vacía significa que la API está en el mismo servidor que sirve la página.
const meta = document.querySelector('meta[name="api-url"]');

export const API_URL = (meta?.content ?? "").replace(/\/$/, "");
