import express from "express"
import asyncHandler from "express-async-handler";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config()

const db = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_KEY);

async function insertExpense (table,username, amount_spent, date, time, category){
    const {data, error} = await db.from("expenses").insert([{username, amount_spent,date,time,category}]);

    if (error){
        console.log(`EXPENSE INSERTION FAILED ${JSON.stringify(error,null,2)}`);
        return false;
    }
    return true;
}

async function selectExpense(table, username){
    const {data, error} = await db.from("expenses").select("*").eq("username",username);

    if (error){
        console.log(`EXPENSE TABLE SEARCH FAILED ${JSON.stringify(error,null,2)}`);
        return false;
    }
    return data;
}

export const getHistory = asyncHandler(async (req, res) => {
    const {username} = req.body;
    const data = await selectExpense("expenses",username);
    if (!data){
        return res.status(500).json({"message": "HISTORY GENERATIN FAILED"});
    }
    res.status(200).json({"message": "HISTORY GENERATION DONE", data});
});

export const transaction = asyncHandler(async (req,res) => {
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

    const {balance,err} = await db.from("users").select("max_limit").eq("username",username);

    if (err){
        res.status(500).json({"message": "BALANCE IS NOTE FETCHED IN TRANSACTION","error": err});
    }

    if ((balance-amount_spent)<0){
        console.log(`THE AMOUNT IS OUT OF REACH`);
        res.status(500).json({"message": "THE AMOUNT IS OUT OF REACH","balance": (balance-amount_spent)});
    }

    if (!await insertExpense("expenses",username,amount_spent,date,time,category)){
        return res.status(500).json({"message": "TRANSACTION REGISTRATION FAILED"});
    }
    const {update,e} = await db.from("users").insert("max_limit",(max_limit-amount_spent)).eq("username",username);

    if(e){
        res.status(500).json({"message": "ERROR IN TRANSACTION", "error": e});
    }
    if (!update)
    res.status(200).json({"message": "TRANSACTION REGISTRATION PASSED"});
});

export const getCategories = asyncHandler(async (req,res) => {
    const {username} = req.body;
    let cat = [];

    const data = await selectExpense("expenses",username);

    if (!data){
        res.status(500).json({"message":"CATEGORIES FUNCTION FAILED", })
    }
    for (let c of data){
        console.log(`WITH BRACKET IS ${c["category"]}`);
        if (!cat.includes(c.category)){
            cat.push(c.category);
        }
    }
    if (!cat){
        console.log(`THE CATEGORIES ARE EMPTY`);
    }
    res.status(200).json({"message": "THE CATEGORIES ARE HERE", "data": cat});
});





