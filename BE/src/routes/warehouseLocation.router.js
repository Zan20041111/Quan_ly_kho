import express from "express";
import { createWarehouseLocation, deleteWarehouseLocation, getAllWarehousesLocation, updateWarehouseLocation } from "../controllers/warehouseLocation.js";

const warehouseLocationRoutes = express.Router();

warehouseLocationRoutes.get(`/get_all_warehouses_location`,getAllWarehousesLocation);
warehouseLocationRoutes.post(`/create_warehouse_location`,createWarehouseLocation);
warehouseLocationRoutes.put(`/update_warehouse_location/:id`,updateWarehouseLocation);
warehouseLocationRoutes.delete(`/delete_warehouse_location/:id`,deleteWarehouseLocation);
export default warehouseLocationRoutes;