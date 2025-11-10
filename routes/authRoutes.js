import express from "express";
const router = express();

import {login, register, getBalance, updateBalance, changePassword, getWards, putWards} from "../controllers/authControllers.js";
router.post("/login",login);
router.post("/register",register);
router.post("/getbalance",getBalance);
router.post("/update",updateBalance);
router.post("/changePassword",changePassword);
router.post("/getWards", getWards);
router.post("/putward",putWards);

export default router;