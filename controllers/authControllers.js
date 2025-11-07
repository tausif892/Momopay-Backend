import {createClient} from "@supabase/supabase-js";
import asyncHandler from "express-async-handler";

let db;

try{
    
    db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}catch(err){
    console.log(`DB CONNECTION ERROR`);
    exit(1);
}

console.log(`DB CONNECTED`);

async function usersinsert(table, username, password){
    const {data, error} = await db.from(table)
    .insert([{username,password}])

    if (error){
        console.log(`USERS INSERTION ERROR`);
        return false;
    }  
    return true;
}

async function usersSearch(table, param1, param2){
    const {data, error} = await db.from(table)
    .select("*")
    .eq("username",param1)
    .eq("password",param2);

    if (error){
        console.log(`ERROR IN USERS SEARCHING`);
        return false;
    }
    return data.length>0;
}


const login = asyncHandler(async (req, res) => {
    const {username, password} = req.body;

    const found = await usersSearch(username, password);
    if (!found){
        return res.status(404).json({message: "Invalid username or password"});
    }
    res.status(200).json({message: "LOGIN SUCCESS"});
})

const register = asyncHandler(async (req, res) => {
    const {username, password} = req.body;

    const insert = await usersinsert(username, password);
    if (!insert){
        return res.status(401).json({message: "INSERTION FAILED"});
    }
    res.status(200).json({message: "REGISTRATION SUCCESS"});
})

module.exports = {login, register};