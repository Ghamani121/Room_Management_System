import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import User, { UserDocument } from "../../../models/user";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function loginService(email: string, password: string) {
    //find the email in User db
    const user = await User.findOne<UserDocument>({ email }).select("+password");//select to include the password while returning, its set to false in db

    //if user is empty, then the email does't exist
    if (!user) {
        return { status: StatusCodes.UNAUTHORIZED, data: { message: "Invalid email" } };
    }

    //use user constant to check if the hashed password matches the given password
    const isPasswordValid = await bcrypt.compare(password, user.password!);//!==assures ts that our user password in db cant be null

    if (!isPasswordValid) {
        return { status: StatusCodes.UNAUTHORIZED, data: { message: "invalid password" } };
    }

    //convert object id to string because jwt cant store object id
    const id = user._id.toString();

    //generate jwt
    const token = jwt.sign({
        //data inside the token is called payload
        id,
        name: user.name,
        role: user.role,
        email: user.email,
    },
        JWT_SECRET,
        { expiresIn: "30d" }
    );

    return { status: StatusCodes.OK, data: { message: "Login Successful", token } };
}

export async function logoutService() {
    //you dont need to delete the token, as server doesn't store it
    //frontend deletes it
    return { status: StatusCodes.OK, data: { message: "logged out successfully" } };
}
