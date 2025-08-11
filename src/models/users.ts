import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
  username:{type:String, required:true},
  email: {type:String, required:true},
  authentication: {type:String, required:true, select:false},
  salt:{type:String, select:false},
  //required means that when we create a document in db it needs to have this field 
  //else it throws an error
  //select: when api fetches this schema, auth should be fetched
  sessionToken: {type:String, select:false}
});

export const usermodel=mongoose.model('User',userSchema);

export const getUsers=()=> usermodel.find();
//any parameter is okay
//gets all documents in the user collection 
export const getEmail=(email:String)=>usermodel.findOne({email});
//parameter needs to be an email
//here findOne({email})== findOne({email:email}) where 2nd email will be passed from else where like ghamani121@gmail.com

export const getSessionToken=(sessionToken:String)=>usermodel.findOne({'authentication.sessionToken':sessionToken});
//here we are accessing a nested field therefore have enclosed in quotes and have to use the full name auth.sesesiontoken

export const getUserId=(id:string)=> usermodel.findById(id);
export const createUser= (values:Record<string,any>)=>
    new usermodel(values).save().then((user)=> user.toObject());
//Record<string,any> the created object should have field name as string but value can be of any type
//new usermodel(values) creates a document with provided values
//.save insert the document into db
//toObject converts to plain json
//then((user)=> user.toObject()); returns the mongoose doc

export const deleteUserById= (id:string)=>usermodel.findOneAndDelete({_id:id});
export const updateUserById=(id:string,values:Record<string,any>)=>usermodel.findByIdAndUpdate(id,values);