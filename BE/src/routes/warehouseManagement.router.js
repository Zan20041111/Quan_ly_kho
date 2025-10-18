import express from 'express';
import { createWarehouse, getAllWarehouses } from '../controllers/warehouseManagement.controllers.js';

const warehouseManagementRoutes = express.Router();

warehouseManagementRoutes.get(`/get_all_warehouses`,getAllWarehouses);
warehouseManagementRoutes.post(`/create_warehouse`,createWarehouse)
export default warehouseManagementRoutes;