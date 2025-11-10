import {createClient} from "@supabase/supabase-js";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
dotenv.config();

let db;
try{
    db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}catch(err){
    console.log(`DB CONNECTION ERROR`);
}

console.log(`DB CONNECTED`);

export async function usersinsert(table, username, password){
    console.log(`TABLE NAME: ${table}`);
    console.log(`USERNAME: ${username}`);
    console.log(`PASSWORD: ${password}`);
    db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const {data, error} = await db.from(table)
    .insert([{username,password}])

    if (error){
        console.log(`USERS INSERTION ERROR ${JSON.stringify(error,null,2)}`);
        return false;
    }  
    return true;
}

export async function usersSearch(table, param1, param2){
    console.log(`TABLE NAME: ${table}`);
    console.log(`USERNAME: ${param1}`);
    console.log(`PASSWORD: ${param2}`);
    db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const {data, error} = await db.from(table)
    .select("*")
    .eq("username",param1)
    .eq("password",param2);

    if (error){
        console.log(`ERROR IN USERS SEARCHING`);
        return false;
    }
    return data;
}


export const login = asyncHandler(async (req, res) => {
    const {username, password} = req.body;
    let table = "users";
    const found = await usersSearch(table,username, password);
    if (!found){
        return res.status(404).json({message: "Invalid username or password"});
    }
    res.status(200).json({message: "LOGIN SUCCESS ",content: JSON.stringify(found)});
});

export const register = asyncHandler(async (req, res) => {
    const {username, password} = req.body;
    let table="users";
    const insert = await usersinsert(table,username, password);
    if (!insert){
        return res.status(401).json({message: "INSERTION FAILED"});
    }
    res.status(200).json({message: "REGISTRATION SUCCESS", content: JSON.stringify(insert)});
});

export const getBalance = asyncHandler(async (req,res) => {
    const {username} = req.body;

    if (!username){
        res.status(401).json({"message": "USERNAME OR PASSWORD IS MISSING"});
    }  
    
    const { data, error } = await db
    .from("users").select("max_limit").eq("username", username); 
    
    if (error){
        res.status(500).json({"error": error, "function": "UPDATE BALANCE"});
    }

    res.status(200).json({"message": "BALANCE FOUND", "balance": data});
});

export const updateBalance = asyncHandler(async (req,res) => {
    const {username, newBalance} = req.body;

    if (!username || !newBalance){
        res.status(401).json({"message": "USERNAME OR PASSWORD IS MISSING"});
    }  
    
    const { data, error } = await db
    .from("users")
    .update({ max_limit: newBalance })
    .eq("username", username); 
    
    if (error){
        res.status(500).json({"error": error, "function": "UPDATE BALANCE"});
    }

    res.status(200).json({"message": "BALANCE UPDATED"});
});

export const changePassword = asyncHandler(async (req,res) => {
    const {username, password} = req.body;

    if (!username || !password){
        res.status(401).json("MALFORMED REQUEST CHANGE PASSWORD");
    }

    const {data, error} = await db.from("users").update("password",password).eq("username",username);

    if (error){
        res.status(500).json({"message": "CHANGE PASSWORD DB ERROR", "error": error});
    }
    res.status(200).json({"message":"PASSWORD CHANGED SUCCESSFULLY"});
});

export const getWards = asyncHandler(async (req,res)=>{
    const {username}=req.body;

    const {data,error} = await db.from("users").select("wards").eq("username",username);

    if (error){
        console.log(`THERE IS AN ERROR IN GETTING WARDS ${JSON.stringify(error)}`);
    }
    res.status(200).json({"message":"GETTING WARDS SUCCESS", "wards":data});
});

export const putWards = asyncHandler(async(req,res)=>{
    const {username, wards} = req.body;
    const wardsArray = Array.isArray(wards) ? wards : [wards];
    const {data,error} = await db.from("users").update({"wards":wardsArray}).eq("username",username);

    if (error){
        console.log(`ERROR IN PUTTING WARDS ${JSON.stringify(error)}`);
        return res.json(500).message({"message":"ERROR IN DB"})
    }
    res.status(200).json({"message":"PUTTING WARDS SUCCESSFUL","wards":wards});
});



export default {login, register, getBalance, updateBalance, changePassword};