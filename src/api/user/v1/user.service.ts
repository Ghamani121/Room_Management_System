import User,{UserDocument} from "../../../models/user";

export async function getUserById(id:string):Promise<UserDocument|null> {
    return User.findById(id).exec();
}

export async function createUser(data:{
    name:string;
    email:string;
    password:string;
    role:'admin' | 'employee';
}) : Promise<UserDocument>{
    const user=new User(data);
    return user.save();
}