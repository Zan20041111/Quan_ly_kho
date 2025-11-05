import express from "express";
import { createAutoGoodsReceipt, getAllGoodsReceipt } from "../controllers/goodsReceipt.js";

const goodsReceiptRoutes = express.Router();

goodsReceiptRoutes.get(`/get_all_goodsreceipt`, getAllGoodsReceipt);
goodsReceiptRoutes.post(`/create_goodsreceipt`,createAutoGoodsReceipt);
export default goodsReceiptRoutes;