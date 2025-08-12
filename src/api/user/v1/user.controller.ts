import {Request,Response} from 'express';
import *as userService from './user.service';


//logic to create user
export async function createUser(req:Request,res:Response)
{
    try{
        // const{name,email,password,role}=req.body;
        //request body is valid as done by the validaton file

        // if(!name || !email || !password || !role)
        //     return res.status(400).json({message:'fields are missing'});
        // if(role !=='admin' && role !=='employee')
        //     return res.status(400).json({message:'enter correct value for role'});

        const newUser=await userService.createUser(req.body);
        res.status(201).json(newUser);
    }
    catch(error:any)
    {
        console.error(error);
        if(error.code==11000) //duplicate email
            return res.status(409).json({message:'email already exists'});
        res.status(500).json({message:'server error'});
    }
}

//logic to get all users
export async function getUser(req:Request,res:Response) {
    try{
        //first get the info from service layer to what is present in user collection
        const user=await userService.getUser();

        //check if the extracted data has at least one user 
        if(!user || user.length==0)
            return res.status(200).json({message:'no users are found in the database'});

        //now we know user exists, so send the response
        res.json(user);
    }catch(error)
    {
        console.error(error);
        res.status(500).json({message:'server error'});
    }
}

//logic to get user using id
export async function getUserById(req:Request,res:Response)
{
    try{
        //takes the id from the path given and checks if the id exists in the url
        const id=req.params.id;
        if(!id) return res.status(400).json({messsage:'mising user id parameter in given url'});

        //calls the service layer to fetch users acc to the id extracted
        const user=await userService.getUserById(id);
        //checks if id exists in the db
        if(!user) return res.status(404).json({message:'user with given id not found'});
        res.json(user);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:'server error'});
    }
}

//logic to update user
export async function updateUserById(req:Request, res:Response)
{
    try{
        const id=req.params.id;
        //id not given in the url
        if(!id) 
            return res.status(400).json({messsage:'mising user id parameter in given url'});

        //calls the service layer to fetch users acc to the id extracted
        const updatedUser=await userService.updateUserById(id,req.body);

        //checks if id exists in the db
        if(!updatedUser) return res.status(404).json({message:'user with given id not found'});

        res.status(200).json(updatedUser);
    }
    catch(error:any){
        console.error(error);

        if(error.code==11000)
            return res.status(409).json({message:'email already exists'});

        res.status(500).json({message:'server error'});
    }
}

//logic to delete user by id
export async function deleteUserById(req:Request, res:Response) 
{
    try{
        const id=req.params.id;
        //id not given in the url
        if(!id) 
            return res.status(400).json({messsage:'Missing user ID parameter in given URL'});

        const deletedUser=await userService.deleteUserById(id);

        if(!deletedUser)
            return res.status(404).json({message:'user with given id not found'});

        res.status(204);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:'server error'});
    }
}



