import Room from "../../../models/room";
import room,{RoomDocument} from "../../../models/room";


//Promise<T>

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
