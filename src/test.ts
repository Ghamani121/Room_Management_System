import mongoose from "mongoose";
import Booking from "./models/booking";

async function testConcurrentBooking() {
  await mongoose.connect("mongodb://localhost:27017/room_management_system");

  const roomId = "64eabc1234567890abcdef12"; // existing room id
  const startTime = new Date("2025-08-20T10:00:00Z");
  const endTime = new Date("2025-08-20T11:00:00Z");

  // Prepare two booking attempts
  const bookingA = {
    roomId,
    userId: "64eabc1234567890abcdef34",
    startTime,
    endTime,
    title: "User A Meeting"
  };

  const bookingB = {
    roomId,
    userId: "64eabc1234567890abcdef56",
    startTime,
    endTime,
    title: "User B Meeting"
  };

  // Run both in parallel
  const results = await Promise.allSettled([
    Booking.create(bookingA),
    Booking.create(bookingB)
  ]);

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      console.log(`Booking ${i + 1} succeeded:`, r.value._id);
    } else {
      console.log(`Booking ${i + 1} failed:`, r.reason.message);
    }
  });

  await mongoose.disconnect();
}

testConcurrentBooking();
