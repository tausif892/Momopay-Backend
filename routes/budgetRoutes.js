import express from "express"
const router = express();

import { getHistory, transaction, getCategories } from "/momopay/controllers/budgetController.js";

router.post("/transaction",transaction);
router.post("/history",getHistory);
router.post("/categories",getCategories);
export default router;