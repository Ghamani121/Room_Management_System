import { Schema, model, Document } from 'mongoose'
//schema: defining structure of documents
//model: creating models from schemas
//Document: interface for ts type definition


//extends mongoose's Document interface and defines document for user
//declare the properties of the document
export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
}
//interface used here is only for typesafety during development, it doesn't affect mongodb 
//schema defines the actual structure of the database,validation and behaviour ie, during runtime
//schema enforces rules while reading and writing from mongodb
//mongoose validates it before saving data

//create new schema using generics(template) 
const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select:false },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    required: true
  }
}, {timestamps:true});

//required: the field needs to ex

const User = model<UserDocument>('User', userSchema);

export default User;


