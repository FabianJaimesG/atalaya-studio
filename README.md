# Atalaya Studio

Sitio web de **Atalaya Studio**, el estudio de diseño ficticio que sirve de caso práctico en la materia Desarrollo Web de la especialización en la Corporación Universitaria de Asturias. El proyecto crece unidad tras unidad:

| Unidad | Qué aporta | Estado |
|---|---|---|
| U1. Fundamentos del frontend moderno | HTML5 semántico, CSS responsive, JavaScript en módulos, testimonios cargados desde una API, renderizado seguro | ✅ |
| U2. Arquitectura y despliegue | API propia con Node.js y Express, formulario conectado al servidor, preferencias en `localStorage`, borrador en `sessionStorage`, microinteracciones, despliegue | ✅ |
| U3. Integración y presentación | Control de versiones, mantenimiento, pruebas, documentación | Pendiente |

## Cómo ejecutarlo

Requiere Node.js 20 o superior.

```bash
npm install
cp .env.example .env   # opcional
npm run dev            # http://localhost:3000, se reinicia al guardar
npm test               # pruebas de la API y de la validación
```

## Estructura

```
├── server.js            # arranca el servidor (lee .env)
├── app.js               # Express: rutas de la API, seguridad y archivos estáticos
├── data/contenido.js    # servicios y testimonios (en memoria, sin base de datos)
├── public/              # frontend
│   ├── index.html       # HTML semántico y accesible
│   ├── css/styles.css   # mobile-first, variables de color, modo oscuro, microinteracciones
│   └── js/
│       ├── main.js         # conecta los módulos y coordina el flujo
│       ├── api.js          # único módulo que habla con el servidor (fetch + async/await)
│       ├── storage.js      # único módulo que toca localStorage y sessionStorage
│       ├── ui.js           # pinta los datos con textContent y DocumentFragment
│       ├── form.js         # validación, borrador, envío y confirmación visual
│       ├── validacion.js   # reglas compartidas por el navegador y el servidor
│       ├── menu.js         # menú móvil accesible y sección activa
│       ├── tema.js         # botón de modo oscuro
│       ├── tema-inicial.js # aplica el tema antes de pintar (evita el destello)
│       └── config.js       # URL de la API, leída del <meta name="api-url">
├── test/                # node:test
├── render.yaml          # despliegue del servicio en Render
└── netlify.toml         # despliegue opcional del frontend en Netlify
```

## API

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/salud` | `{ ok: true }` (chequeo de Render) |
| GET | `/api/servicios` | lista de servicios |
| GET | `/api/testimonios` | lista de testimonios |
| POST | `/api/contacto` | `201` si el mensaje es válido · `400` con el error de cada campo · `413` si pesa más de 10 kB · `429` si una IP envía más de 5 mensajes en 10 minutos |

Los mensajes se guardan en memoria y se pierden al reiniciar el servidor. Cuando el volumen crezca, el siguiente paso es una base de datos gestionada.

## Cómo responde al caso práctico de la Unidad 2

- **Conectar frontend y backend:** el formulario envía `POST /api/contacto` con `fetch`. El servidor vuelve a validar con las mismas reglas que el navegador (`validacion.js`) y responde con códigos de estado claros.
- **Seguridad:** todo el contenido externo se pinta con `textContent` (sin `innerHTML`); hay cabeceras CSP, `nosniff` y `Referrer-Policy`; el cuerpo de las peticiones se limita a 10 kB; los envíos se limitan por IP; CORS solo se abre al dominio configurado en `ORIGEN_FRONTEND`; la configuración va en variables de entorno.
- **Rendimiento y fluidez:** los servicios se guardan en caché una hora en `localStorage`; las listas se arman en un `DocumentFragment`; el botón de envío se bloquea mientras carga para evitar envíos dobles; cada carga muestra su estado (cargando, error con botón de reintentar, éxito).
- **Personalización sin base de datos:** el tema, el nombre (solo si la persona marca «Recordar mi nombre») y los tres últimos servicios vistos persisten en `localStorage`; el borrador del formulario vive en `sessionStorage` y sobrevive a una recarga. El pie tiene un botón para borrar todo lo guardado. Nunca se guardan contraseñas ni tokens.
- **UX/UI:** estados `hover`, `active`, `focus-visible` y `disabled` en los controles, tarjetas que se elevan, indicador de carga en el botón, mensajes anunciados a lectores de pantalla (`role="status"`), foco visible, contraste WCAG y respeto a `prefers-reduced-motion`.

## Despliegue

**Opción recomendada, un solo servicio en Render.** Express sirve la API y el frontend, así que no hace falta CORS.

1. En Render: *New → Blueprint* y elegir este repositorio (usa `render.yaml`).
2. Render instala con `npm ci`, arranca con `npm start` y vigila `/api/salud`.
3. El plan gratuito «duerme» el servicio tras un rato sin visitas; la primera carga puede tardar unos segundos.

**Opción alternativa, frontend en Netlify y API en Render.**

1. Publicar la API en Render como arriba.
2. En `public/index.html`, poner la URL de Render en `<meta name="api-url" content="https://….onrender.com">`.
3. En Netlify, importar el repositorio; `netlify.toml` publica la carpeta `public`.
4. En Render, definir `ORIGEN_FRONTEND` con el dominio de Netlify para habilitar CORS.

Antes de publicar conviene auditar con Lighthouse (rendimiento, accesibilidad y SEO por encima de 90).

---

Autor: Fabián Alexis Jaimes Gelves.
