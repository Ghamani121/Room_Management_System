import {Request,Response} from 'express';
import *as userService from './user.service';

export async function getUser(req:Request,res:Response)
{
    try{
        const id=req.params.id;
        if(!id) return res.status(400).json({messsage:'mising user id parameter'});

        const user=await userService.getUserById(id);
        if(!user) return res.status(404).json({message:'user not found'});
        res.json(user);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:'server error'});
    }
}

export async function createUser(req:Request,res:Response)
{
    try{
        const{name,email,password,role}=req.body;
        // if(!name || !email || !password || !role)
        //     return res.status(400).json({message:'fields are missing'});
        // if(role !=='admin' && role !=='employee')
        //     return res.status(400).json({message:'enter correct value for role'});

        const newUser=await userService.createUser({name,email,password,role});
        res.status(201).json(newUser);
    }
    catch(error:any)
    {
        console.error(error);
        if(error.code==11000) //duplicate email
            return res.status(400).json({message:'email already exists'});
        res.status(500).json({message:'server error'});
    }
}

