const mongoose = require("mongoose");
const bookings = require("./booking.json"); // your JSON file

const MONGO_URI = "mongodb://localhost:27017/room_management_system";

// Define schema directly here
const attendeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    attendees: { type: [attendeeSchema], default: [], required: true },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);

    await Booking.insertMany(bookings);

    console.log("Bookings inserted successfully with ObjectIds!");
    process.exit(0);
  } catch (err) {
    console.error("Error inserting bookings:", err);
    process.exit(1);
  }
}

run();
