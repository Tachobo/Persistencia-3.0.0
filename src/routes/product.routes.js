import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { validateSchema } from "../middlewares/validator.middleware.js";
import { productSchema } from "../schemas/product.schema.js";
import { checkPermission } from "../middlewares/authorization.js";
// Importamos nuestro guardian
import { verifyToken } from "../middlewares/auth.middleware.js";

export const productRouter = Router();

productRouter.get("/", verifyToken, checkPermission("products.read"), getAllProducts);

productRouter.get("/:id", verifyToken, checkPermission("products.read"), getProductById);

productRouter.post("/", verifyToken, checkPermission("products.create"), validateSchema(productSchema), createProduct);

productRouter.put("/:id", verifyToken, checkPermission("products.update"), validateSchema(productSchema), updateProduct);

productRouter.delete("/:id", verifyToken, checkPermission("products.delete"), deleteProduct);
