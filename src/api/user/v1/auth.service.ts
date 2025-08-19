import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import User, { UserDocument } from "../../../models/user";
import { sendPasswordResetEmail } from '../../../utils/sendmail';
import { isTempPasswordFormat } from '../../../utils/temppassword';

const JWT_SECRET = process.env.JWT_SECRET as string;




export async function loginService(email: string, password: string) {
    //find the email in User db
    const user = await User.findOne<UserDocument>({ email }).select("+password");//select to include the password while returning, its set to false in db

    //if user is empty, then the email does't exist
    if (!user) {
        return { status: StatusCodes.UNAUTHORIZED, data: { message: "Invalid email" } };
    }

    //detect if the user is logging in with temp password to force passsword change
    //we haave specific format for default password, so just check user input mataches the foramt to determine if thery are logging in for the first time
    if (isTempPasswordFormat(password)) {
        console.log("Checking temp password format:", password, isTempPasswordFormat(password));

        await sendPasswordResetEmail(user.email);

        return {
            status: StatusCodes.OK,
            data: { message: "Temporary password detected. Change password to login. Instructions have been sent to your email." }
        };
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

    const user_details={
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return { status: StatusCodes.OK, data: { message: "Login Successful", token, user: user_details } };
}







export async function logoutService() {
    //you dont need to delete the token, as server doesn't store it
    //frontend deletes it
    return { status: StatusCodes.OK, data: { message: "logged out successfully" } };
}





//fucntion to change the password
export async function changePasswordService(
  userId: string,
  email: string,
  oldPassword: string,
  newPassword: string
) {
  try {
    // 1. Find user
    const user = await User.findOne<UserDocument>({ _id: userId, email }).select("+password");

    if (!user ) {
      return { status: StatusCodes.BAD_REQUEST, data: { error: "UserNotFound", message: "User not found in the db" } };
    }

    // 2. Validate old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password!);
    if (!isPasswordValid) {
      return { status: StatusCodes.UNAUTHORIZED, data: { error: "InvalidPassword", message: "Invalid old password" } };
    }

    // 3. Prevent reusing the same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return { status: StatusCodes.BAD_REQUEST, data: { error: "PasswordReuse", message: "New password cannot be same as old password" } };
    }

    // 4. Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { status: StatusCodes.OK, data: { error: null, message: "Password changed successfully" } };
  } catch (err) {
    console.error("Change password service error:", err);
    return { status: StatusCodes.INTERNAL_SERVER_ERROR, data: { error: "ServerError", message: "Internal server error" } };
  }
};
