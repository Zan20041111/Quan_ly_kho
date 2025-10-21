import express from "express";
import { createCustomer, deleteCustomer, getAllCustomer, updateCustomer } from "../controllers/customer.js";

const customerRoutes = express.Router();

customerRoutes.get(`/get_all_customer`,getAllCustomer);
customerRoutes.post(`/create_customer`,createCustomer);
customerRoutes.put(`/update_customer/:id`,updateCustomer);
customerRoutes.delete(`/delete_customer/:id`,deleteCustomer);
export default customerRoutes;