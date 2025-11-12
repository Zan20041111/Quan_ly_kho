import express from "express";
import { createAutoGoodsIssue, getAllGoodsIssue, exportProduct, getDetailGoodsIssueByID } from "../controllers/goodsIssue.js";
import { searchGoodsReceipt } from "../controllers/goodsReceipt.js";

const goodsIssueRoutes = express.Router();

goodsIssueRoutes.get(`/get_all_goodsissue`, getAllGoodsIssue);
goodsIssueRoutes.post(`/create_goodsissue`,createAutoGoodsIssue);
goodsIssueRoutes.post(`/export_product`,exportProduct);
goodsIssueRoutes.get(`/get_detail_goodsissue_byid/:id`,getDetailGoodsIssueByID);
goodsIssueRoutes.get(`/search_goodsissue`,searchGoodsReceipt);
export default goodsIssueRoutes;