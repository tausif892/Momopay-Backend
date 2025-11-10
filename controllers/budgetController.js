import express from "express"
import asyncHandler from "express-async-handler";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config()

const db = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_KEY);

async function insertExpense (table,username, amount_spent, date, time, category, recipient){
    const {data, error} = await db.from("expenses").insert([{"username":username, "amount_spent":amount_spent,"date":date,"time":time,"category":category, "recipient_username": recipient}]);

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
    res.status(200).json({"message": "HISTORY GENERATION DONE","data":data});
});

export const transaction = asyncHandler(async (req,res) => {
    const {username, amount_spent, category, recipient} = req.body;

    
    const date = new Date();
    console.log(`THE TRANSACTION USERNAME IS ${username}`);
    console.log(`THE TRANSACTION CATEGORY IS ${category}`);
    console.log(`THE TRANSACTION AMOUNT IS ${amount_spent}`);
    console.log(`THE RECIPIENT USER ID IS ${recipient}`);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    console.log(`THE FORMATTED DATE IS ${formattedDate}`);
    const time = String(date.getHours()).padStart(2,"0");
    const min = String(date.getMinutes()).padStart(2,"0");
    const sec = String(date.getSeconds()).padStart(2,"0");
    const formattedTime = `${time}:${min}:${sec}`;
    console.log(`THE FORMATTED  TIME IS ${formattedTime}`);

    const {data:balance,error:err} = await db.from("users").select("max_limit").eq("username",username);
    console.log(`THE BALANCE WITH THE USER IS ${JSON.stringify(balance[0].max_limit)}`);
    if (err){
        res.status(500).json({"message": "BALANCE IS NOTE FETCHED IN TRANSACTION","error": err});
    }

    if ((balance.max_limit-amount_spent)<0){
        console.log(`THE AMOUNT IS OUT OF REACH`);
        res.status(500).json({"message": "THE AMOUNT IS OUT OF REACH","balance": (balance[0].max_limit-amount_spent)});
    }

    if (!await insertExpense("expenses",username,amount_spent,formattedDate,formattedTime,category, recipient)){
        return res.status(500).json({"message": "TRANSACTION REGISTRATION FAILED"});
    }
    const leftover = balance[0].max_limit - amount_spent;
    console.log(`THE REMAINING BALANCE WITH THE USER AFTER THIS TRANSACTION IS ${leftover}`);
    const {data:update,error:e} = await db.from("users").update({"max_limit":leftover}).eq("username",username);

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





