import express from "express"
const router = express();

const {getHistory, transaction} = require("../controllers/budgetController.js");

router.post("/budget/transaction",transaction);
router.post("/budget/history",getHistory);

module.exports = router;