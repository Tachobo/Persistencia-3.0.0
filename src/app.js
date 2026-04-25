import express from "express";
import "./config/db.js";
import {
  authRouter,
  categoryRouter,
  productRouter
} from "./routes/index.js";

// 1. Importamos nuestro manejador global
import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    messaje: "Saludo de la API",
    data: [],
    errors: [],
  });
})

app.use("/api/auth", authRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);

// 2. Conectamos el Middleware Global de Errores al final de todas las rutas
app.use(globalErrorHandler);

export default app;