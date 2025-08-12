import User,{UserDocument} from "../../../models/user";


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
    const user=new User(data);
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
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
}

//deleteUserById
export async function deleteUserById(id:string)
:Promise<UserDocument|null>{
    return User.findByIdAndDelete(id).exec();
}

