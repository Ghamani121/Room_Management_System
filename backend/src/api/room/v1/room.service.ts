import Room,{RoomDocument} from "../../../models/room";


//Promise<T> asynchronous function always return a promisse

//create room in db
//we are assigning all the parameters recevied to object data having given properties
export async function createroom(data:{
    name:'Board Room' | 'Conference Room';
    capacity:number,
    equipment: string[];
}): Promise<RoomDocument>{

    //Room here is a model class that repressents room collection in db
    //we create a new instance of this model aka a new document
    const room=new Room(data);

    // we save the document into database which is returned to controller file
    return room.save();
}

//get all Rooms in db
export async function getroom():Promise<RoomDocument[]> {
    return Room.find().exec();
}

//get room from db acc to id
export async function getroomById(id:string):Promise<RoomDocument|null> {
    return Room.findById(id).exec();
}


//update room in db using id
export async function updateroomById(
    id: string,
    data: Partial<{
        name:'Board Room' | 'Conference Room';
        capacity: number;
        equipment: string[];
    }>
): Promise<RoomDocument | null> {
    return Room.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
}

//deleteroomById
export async function deleteroomById(id:string)
:Promise<RoomDocument|null>{
    return Room.findByIdAndDelete(id).exec();
}