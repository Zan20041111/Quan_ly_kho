import express from "express";
import { addMultipleProducts, createAutoGoodsReceipt, getAllGoodsReceipt, getDetailGoodsReceiptByID, searchGoodsReceipt } from "../controllers/goodsReceipt.js";

const goodsReceiptRoutes = express.Router();

goodsReceiptRoutes.get(`/get_all_goodsreceipt`, getAllGoodsReceipt);
goodsReceiptRoutes.post(`/create_goodsreceipt`,createAutoGoodsReceipt);
goodsReceiptRoutes.post(`/add_many_product`,addMultipleProducts);
goodsReceiptRoutes.get(`/get_detail_goodsreceipt_byid/:id`,getDetailGoodsReceiptByID);
goodsReceiptRoutes.get(`/search_goodsreceipt`,searchGoodsReceipt);
export default goodsReceiptRoutes;