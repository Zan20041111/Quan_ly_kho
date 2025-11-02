import express from "express";
import { createProduct, deleteProduct, getAllProducts, updateProduct } from "../controllers/products.js";

const productRoutes = express.Router();

productRoutes.get(`/get_all_products`,getAllProducts);
productRoutes.post(`/create_product`,createProduct);
productRoutes.put(`/update_product/:id`,updateProduct);
productRoutes.delete(`/delete_product/:id`,deleteProduct);
export default productRoutes;