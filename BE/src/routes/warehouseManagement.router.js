import express from 'express';
import { createWarehouse, deleteWarehouse, getAllWarehouses, updateWarehouse } from '../controllers/warehouseManagement.controllers.js';

const warehouseManagementRoutes = express.Router();

warehouseManagementRoutes.get(`/get_all_warehouses`,getAllWarehouses);
warehouseManagementRoutes.post(`/create_warehouse`,createWarehouse);
warehouseManagementRoutes.put(`/update_warehouse/:id`,updateWarehouse);
warehouseManagementRoutes.delete(`/delete_warehouse/:id`,deleteWarehouse);
export default warehouseManagementRoutes;