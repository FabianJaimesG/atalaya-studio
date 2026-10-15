import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { crearApp } from "../app.js";

async function levantar(opciones) {
  const servidor = crearApp(opciones).listen(0);
  await once(servidor, "listening");
  return { servidor, base: `http://127.0.0.1:${servidor.address().port}` };
}

function enviar(base, cuerpo) {
  return fetch(`${base}/api/contacto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  });
}

const MENSAJE_VALIDO = {
  nombre: "Fabián",
  correo: "fabian@ejemplo.com",
  mensaje: "Quiero rediseñar la identidad de mi marca.",
};

describe("API de Atalaya Studio", () => {
  let servidor;
  let base;

  before(async () => {
    ({ servidor, base } = await levantar());
  });
  after(() => servidor.close());

  test("GET /api/servicios devuelve la lista de servicios", async () => {
    const res = await fetch(`${base}/api/servicios`);
    assert.equal(res.status, 200);
    const servicios = await res.json();
    assert.ok(servicios.length > 0);
    assert.ok(servicios.every((s) => s.id && s.nombre && s.resumen && s.detalle));
  });

  test("GET /api/testimonios devuelve testimonios", async () => {
    const res = await fetch(`${base}/api/testimonios`);
    assert.equal(res.status, 200);
    assert.ok((await res.json()).length > 0);
  });

  test("POST /api/contacto acepta un mensaje válido con 201", async () => {
    const res = await enviar(base, MENSAJE_VALIDO);
    assert.equal(res.status, 201);
    const cuerpo = await res.json();
    assert.equal(cuerpo.ok, true);
    assert.match(cuerpo.mensaje, /Fabián/);
  });

  test("POST /api/contacto rechaza datos inválidos con 400 y el error de cada campo", async () => {
    const res = await enviar(base, { nombre: " ", correo: "no-es-correo", mensaje: "hola" });
    assert.equal(res.status, 400);
    const { campos } = await res.json();
    assert.deepEqual(Object.keys(campos).sort(), ["correo", "mensaje", "nombre"]);
  });

  test("un JSON mal formado responde 400 en JSON, sin detalles internos", async () => {
    const res = await enviar(base, "{ nombre: ");
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "La solicitud no tiene un formato válido." });
  });

  test("un cuerpo de más de 10 kB responde 413", async () => {
    const res = await enviar(base, { ...MENSAJE_VALIDO, mensaje: "a".repeat(20_000) });
    assert.equal(res.status, 413);
  });

  test("una ruta de la API que no existe responde 404 en JSON", async () => {
    const res = await fetch(`${base}/api/no-existe`);
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error, "Recurso no encontrado.");
  });

  test("sirve el frontend con cabeceras de seguridad", async () => {
    const res = await fetch(`${base}/`);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /<h1>Diseño que se ve desde lejos<\/h1>/);
    assert.match(res.headers.get("content-security-policy"), /default-src 'self'/);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-powered-by"), null);
  });
});

describe("CORS", () => {
  let servidor;
  let base;

  before(async () => {
    ({ servidor, base } = await levantar({ origenesPermitidos: ["https://atalaya.netlify.app"] }));
  });
  after(() => servidor.close());

  test("permite el dominio del frontend", async () => {
    const res = await fetch(`${base}/api/servicios`, { headers: { Origin: "https://atalaya.netlify.app" } });
    assert.equal(res.headers.get("access-control-allow-origin"), "https://atalaya.netlify.app");
  });

  test("no autoriza otros dominios", async () => {
    const res = await fetch(`${base}/api/servicios`, { headers: { Origin: "https://sitio-ajeno.com" } });
    assert.equal(res.headers.get("access-control-allow-origin"), null);
  });
});

describe("límite de envíos", () => {
  let servidor;
  let base;

  before(async () => {
    ({ servidor, base } = await levantar({ limiteEnvios: { maximo: 2, ventanaMs: 60_000 } }));
  });
  after(() => servidor.close());

  test("responde 429 cuando una IP envía demasiados mensajes seguidos", async () => {
    assert.equal((await enviar(base, MENSAJE_VALIDO)).status, 201);
    assert.equal((await enviar(base, MENSAJE_VALIDO)).status, 201);
    assert.equal((await enviar(base, MENSAJE_VALIDO)).status, 429);
  });
});
