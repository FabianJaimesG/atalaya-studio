import dotenv from "dotenv";
import { crearApp } from "./app.js";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 3000;
const origenesPermitidos = (process.env.ORIGEN_FRONTEND ?? "")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

crearApp({ origenesPermitidos }).listen(PORT, () => {
  console.log(`Atalaya Studio en http://localhost:${PORT}`);
});
