import express from "express";
import cors from "cors";
import personaRoutes from "./routes/persona.routes.js";
import cargaRoutes from "./routes/carga.routes.js";
import fichaRoutes from "./routes/ficha.routes.js";

const app = express();


app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

// Rutas
app.use("/api/personas", personaRoutes);
app.use("/api/carga", cargaRoutes);
app.use("/api/fichas", fichaRoutes);

export default app;