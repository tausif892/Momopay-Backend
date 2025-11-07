import express from "express"
import asyncHandler from "express-async-handler";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config()

let db;

try{
    db = createClient(process.env.SUPABASE_URI,process.env.SUPABASE_KEY);
}catch(err){
    console.log(`DATABASE CONNECTION FAILED`);
}

async function insertExpense (table,username, amount_spent, date, time, category){
    const {data, error} = await db.from(table).insert([{username, amount_spent,date,time,category}]);

    if (error){
        console.log(`EXPENSE INSERTION FAILED ${error}`);
        return false;
    }
    return true;
}

async function selectExpense(table, username){
    const {data, error} = await db.from(table).select("*").eq("username",username);

    if (error){
        console.log(`EXPENSE TABLE SEARCH FAILED`);
        return false;
    }
    return true;
}

const getHistory = asyncHandler(async (req, res) => {
    const {username} = req.body;
    if (!await selectExpense("expenses",username)){
        return res.status(500).json({"message": "HISTORY GENERATIN FAILED"});
    }
    res.status(200).json({"message": "HISTORY GENERATION DONE"});
});

const transaction = asyncHandler(async (req,res) => {
    const {username, amount_spent, category} = req.body;

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    console.log(`THE FORMATTED DATE IS ${formattedDate}`);
    const time = date.getHours();
    const min = date.getMinutes();
    const formattedTime = `${time}:${min}`;

    if (!await insertExpense("expenses",username,amount_spent,date,time,category)){
        return res.status(500).json({"message": "TRANSACTION REGISTRATION FAILED"});
    }
    res.status(200).json({"message": "TRANSACTION REGISTRATION PASSED"});
});


