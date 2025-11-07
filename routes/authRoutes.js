import express from "express";
const router = express();

const {login, register} = require("../controllers/authControllers.js");

router.post("/login",login);
router.post("/register",register);

module.exports=router;