import express from "express";
import {
    getInventoryByProduct,
    getInventoryDetailByProduct,
    getInventoryByWarehouse
} from "../controllers/reports.js";

const reportsRoutes = express.Router();

reportsRoutes.get("/inventory/by-product", getInventoryByProduct);
reportsRoutes.get("/inventory/detail/:product_id", getInventoryDetailByProduct);
reportsRoutes.get("/inventory/by-warehouse/:id", getInventoryByWarehouse);

export default reportsRoutes;

