import express from "express";
const router = express();

import {login, register, getBalance, updateBalance, changePassword} from "/momopay/controllers/authControllers.js";
router.post("/login",login);
router.post("/register",register);
router.post("/getbalance",getBalance);
router.post("/update",updateBalance);
router.post("/changePassword",changePassword);

export default router;