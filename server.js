import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

import authRoutes from "./routes/authRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();
const PORT = 3000;

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

if (db) {
  console.log(`✅ SUPABASE CONNECTED!`);
}

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/budget", budgetRoutes);
app.use("/payment", paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
