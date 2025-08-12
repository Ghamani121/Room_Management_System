import User,{UserDocument} from "../../../models/user";
import bcrypt from "bcrypt";//for salt hashing
const salt=10;
//this file makes the channges in the database or fetches data from it


//get all users in db
export async function getUser():Promise<UserDocument[]> {
    return User.find().exec();
}

//get user from db acc to id
export async function getUserById(id:string):Promise<UserDocument|null> {
    return User.findById(id).exec();
}

//create user in db
export async function createUser(data:{
    name:string;
    email:string;
    password:string;
    role:'admin' | 'employee';
}) : Promise<UserDocument>{
    //hash the password before saving
    const hashedPassword=await bcrypt.hash(data.password,salt);
    const user=new User({
        ...data,//copies all fields from data(name,email,password,role)
        password: hashedPassword  //overwrites plain password with hashed password
    });
    return user.save();
}

//update user in db using id
export async function updateUserById(
    id: string,
    data: Partial<{
        name: string;
        email: string;
        password: string;
        role: 'admin' | 'employee';
    }>
): Promise<UserDocument | null> {
    // If password is being updated(field is present),hash it
    if (data.password) {
        data.password = await bcrypt.hash(data.password, salt);
    }
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
}

//deleteUserById
export async function deleteUserById(id:string)
:Promise<UserDocument|null>{
    return User.findByIdAndDelete(id).exec();
}

