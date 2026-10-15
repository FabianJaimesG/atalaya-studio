import { test } from "node:test";
import assert from "node:assert/strict";
import { limpiarContacto, validarContacto } from "../public/js/validacion.js";

test("un mensaje completo no tiene errores", () => {
  const errores = validarContacto({
    nombre: "Ana",
    correo: "ana@correo.co",
    mensaje: "Necesito un logotipo nuevo.",
  });
  assert.deepEqual(errores, {});
});

test("los espacios no cuentan como contenido", () => {
  const errores = validarContacto({ nombre: "   ", correo: "a@b.co", mensaje: "          " });
  assert.ok(errores.nombre);
  assert.ok(errores.mensaje);
});

test("detecta correos mal escritos", () => {
  for (const correo of ["ana", "ana@", "ana@dominio", "ana @dominio.com"]) {
    assert.ok(validarContacto({ nombre: "Ana", correo, mensaje: "Mensaje de prueba" }).correo, correo);
  }
});

test("respeta los límites de longitud", () => {
  const errores = validarContacto({
    nombre: "x".repeat(81),
    correo: "a@b.co",
    mensaje: "x".repeat(1001),
  });
  assert.ok(errores.nombre);
  assert.ok(errores.mensaje);
});

test("tolera entradas que no son objetos", () => {
  assert.deepEqual(limpiarContacto(null), { nombre: "", correo: "", mensaje: "" });
  assert.ok(validarContacto("texto").nombre);
});
