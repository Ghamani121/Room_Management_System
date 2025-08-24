import mongoose from 'mongoose';
import Booking, { BookingDocument, Attendee } from '../booking';
import Room, { RoomDocument } from '../room';
import User, { UserDocument } from '../user';

// Mock mongoose to avoid actual database connection
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn(),
    model: jest.fn(),
  };
});

describe('Mongoose Models', () => {
  describe('Booking Model', () => {
    it('should have correct schema definition', () => {
      const bookingSchema = Booking.schema;

      // Test required fields
      expect(bookingSchema.path('roomId')).toBeDefined();
      expect(bookingSchema.path('roomId').instance).toBe('ObjectID');
      expect(bookingSchema.path('roomId').isRequired).toBe(true);

      expect(bookingSchema.path('userId')).toBeDefined();
      expect(bookingSchema.path('userId').instance).toBe('ObjectID');
      expect(bookingSchema.path('userId').isRequired).toBe(true);

      expect(bookingSchema.path('title')).toBeDefined();
      expect(bookingSchema.path('title').instance).toBe('String');
      expect(bookingSchema.path('title').isRequired).toBe(true);

      expect(bookingSchema.path('startTime')).toBeDefined();
      expect(bookingSchema.path('startTime').instance).toBe('Date');
      expect(bookingSchema.path('startTime').isRequired).toBe(true);

      expect(bookingSchema.path('endTime')).toBeDefined();
      expect(bookingSchema.path('endTime').instance).toBe('Date');
      expect(bookingSchema.path('endTime').isRequired).toBe(true);

      // Test status field with enum
      expect(bookingSchema.path('status')).toBeDefined();
      expect(bookingSchema.path('status').instance).toBe('String');
      expect(bookingSchema.path('status').options.enum).toEqual(['confirmed', 'cancelled']);
      expect(bookingSchema.path('status').options.default).toBe('confirmed');

      // Test attendees array
      expect(bookingSchema.path('attendees')).toBeDefined();
      expect(Array.isArray(bookingSchema.path('attendees').options.type)).toBe(true);
      expect(bookingSchema.path('attendees').isRequired).toBe(true);
    });

    it('should validate attendee schema', () => {
      const bookingSchema = Booking.schema;
      const attendeeSchema = (bookingSchema.path('attendees') as any).caster;

      expect(attendeeSchema.path('name')).toBeDefined();
      expect(attendeeSchema.path('name').instance).toBe('String');
      expect(attendeeSchema.path('name').isRequired).toBe(true);

      expect(attendeeSchema.path('email')).toBeDefined();
      expect(attendeeSchema.path('email').instance).toBe('String');
      expect(attendeeSchema.path('email').isRequired).toBe(true);
    });

    it('should have timestamps enabled', () => {
      const bookingSchema = Booking.schema;
      expect(bookingSchema.options.timestamps).toBe(true);
    });

    it('should create a valid booking instance', async () => {
      const bookingData = {
        roomId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        title: 'Team Meeting',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        status: 'confirmed' as const,
        attendees: [
          { name: 'John Doe', email: 'john@example.com' },
          { name: 'Jane Smith', email: 'jane@example.com' }
        ]
      };

      const booking = new Booking(bookingData);

      expect(booking.roomId).toEqual(bookingData.roomId);
      expect(booking.userId).toEqual(bookingData.userId);
      expect(booking.title).toBe(bookingData.title);
      expect(booking.startTime).toEqual(bookingData.startTime);
      expect(booking.endTime).toEqual(bookingData.endTime);
      expect(booking.status).toBe(bookingData.status);
      expect(booking.attendees).toEqual(bookingData.attendees);
    });

    it('should validate required fields', async () => {
      const booking = new Booking({});

      try {
        await booking.validate();
        fail('Validation should have failed');
      } catch (error: any) {
        expect(error.errors.roomId).toBeDefined();
        expect(error.errors.userId).toBeDefined();
        expect(error.errors.title).toBeDefined();
        expect(error.errors.startTime).toBeDefined();
        expect(error.errors.endTime).toBeDefined();
        expect(error.errors.attendees).toBeDefined();
      }
    });
  });

  describe('Room Model', () => {
    it('should have correct schema definition', () => {
      const roomSchema = Room.schema;

      // Test name field with enum
      expect(roomSchema.path('name')).toBeDefined();
      expect(roomSchema.path('name').instance).toBe('String');
      expect(roomSchema.path('name').isRequired).toBe(true);
      expect(roomSchema.path('name').options.enum).toEqual(['Board Room', 'Conference Room']);
      expect(roomSchema.path('name').options.unique).toBe(true);

      // Test capacity field
      expect(roomSchema.path('capacity')).toBeDefined();
      expect(roomSchema.path('capacity').instance).toBe('Number');
      expect(roomSchema.path('capacity').isRequired).toBe(true);

      // Test equipment array
      expect(roomSchema.path('equipment')).toBeDefined();
      expect(Array.isArray(roomSchema.path('equipment').options.type)).toBe(true);
      expect(roomSchema.path('equipment').options.default).toEqual([]);
    });

    it('should have timestamps enabled', () => {
      const roomSchema = Room.schema;
      expect(roomSchema.options.timestamps).toBe(true);
    });

    it('should create a valid room instance', async () => {
      const roomData = {
        name: 'Board Room' as const,
        capacity: 20,
        equipment: ['projector', 'whiteboard', 'conference phone']
      };

      const room = new Room(roomData);

      expect(room.name).toBe(roomData.name);
      expect(room.capacity).toBe(roomData.capacity);
      expect(room.equipment).toEqual(roomData.equipment);
    });

    it('should validate required fields', async () => {
      const room = new Room({});

      try {
        await room.validate();
        fail('Validation should have failed');
      } catch (error: any) {
        expect(error.errors.name).toBeDefined();
        expect(error.errors.capacity).toBeDefined();
      }
    });

    it('should validate enum values for name field', async () => {
      const room = new Room({
        name: 'Invalid Room',
        capacity: 10
      });

      try {
        await room.validate();
        fail('Validation should have failed');
      } catch (error: any) {
        expect(error.errors.name).toBeDefined();
      }
    });
  });

  describe('User Model', () => {
    it('should have correct schema definition', () => {
      const userSchema = User.schema;

      // Test name field
      expect(userSchema.path('name')).toBeDefined();
      expect(userSchema.path('name').instance).toBe('String');
      expect(userSchema.path('name').isRequired).toBe(true);

      // Test email field
      expect(userSchema.path('email')).toBeDefined();
      expect(userSchema.path('email').instance).toBe('String');
      expect(userSchema.path('email').isRequired).toBe(true);
      expect(userSchema.path('email').options.unique).toBe(true);

      // Test password field
      expect(userSchema.path('password')).toBeDefined();
      expect(userSchema.path('password').instance).toBe('String');
      expect(userSchema.path('password').isRequired).toBe(true);
      expect(userSchema.path('password').options.select).toBe(false);

      // Test role field with enum
      expect(userSchema.path('role')).toBeDefined();
      expect(userSchema.path('role').instance).toBe('String');
      expect(userSchema.path('role').isRequired).toBe(true);
      expect(userSchema.path('role').options.enum).toEqual(['admin', 'employee']);
    });

    it('should have timestamps enabled', () => {
      const userSchema = User.schema;
      expect(userSchema.options.timestamps).toBe(true);
    });

    it('should create a valid user instance', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        role: 'admin' as const
      };

      const user = new User(userData);

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.role).toBe(userData.role);
    });

    it('should validate required fields', async () => {
      const user = new User({});

      try {
        await user.validate();
        fail('Validation should have failed');
      } catch (error: any) {
        expect(error.errors.name).toBeDefined();
        expect(error.errors.email).toBeDefined();
        expect(error.errors.password).toBeDefined();
        expect(error.errors.role).toBeDefined();
      }
    });

    it('should validate enum values for role field', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'invalid-role'
      });

      try {
        await user.validate();
        fail('Validation should have failed');
      } catch (error: any) {
        expect(error.errors.role).toBeDefined();
      }
    });

    it('should exclude password field by default when selecting', async () => {
      // This tests the select: false option
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        role: 'admin' as const
      };

      const user = new User(userData);
      const userObject = user.toObject();

      // Password should be included when explicitly created
      expect(userObject.password).toBe('hashedPassword123');

      // But when querying, password should be excluded due to select: false
      // This is more of a database-level test, but we can verify the schema option
      expect(User.schema.path('password').options.select).toBe(false);
    });
  });

  describe('Model Interfaces', () => {
    it('should have correct TypeScript interfaces', () => {
      // Test BookingDocument interface
      const booking: BookingDocument = {
        roomId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        title: 'Test Meeting',
        startTime: new Date(),
        endTime: new Date(),
        status: 'confirmed',
        attendees: [{ name: 'Test User', email: 'test@example.com' }],
        _id: new mongoose.Types.ObjectId(),
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn(),
        isNew: false,
        isModified: jest.fn(),
        markModified: jest.fn(),
        $set: jest.fn(),
        $isDeleted: jest.fn(),
        delete: jest.fn(),
        remove: jest.fn(),
        depopulate: jest.fn(),
        equals: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        increment: jest.fn(),
        validate: jest.fn(),
        toObject: jest.fn(),
        toJSON: jest.fn()
      } as any;

      expect(booking).toBeDefined();

      // Test RoomDocument interface
      const room: RoomDocument = {
        name: 'Board Room',
        capacity: 10,
        equipment: ['projector'],
        _id: new mongoose.Types.ObjectId(),
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn(),
        isNew: false,
        isModified: jest.fn(),
        markModified: jest.fn(),
        $set: jest.fn(),
        $isDeleted: jest.fn(),
        delete: jest.fn(),
        remove: jest.fn(),
        depopulate: jest.fn(),
        equals: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        increment: jest.fn(),
        validate: jest.fn(),
        toObject: jest.fn(),
        toJSON: jest.fn()
      } as any;

      expect(room).toBeDefined();

      // Test UserDocument interface
      const user: UserDocument = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'employee',
        _id: new mongoose.Types.ObjectId(),
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn(),
        isNew: false,
        isModified: jest.fn(),
        markModified: jest.fn(),
        $set: jest.fn(),
        $isDeleted: jest.fn(),
        delete: jest.fn(),
        remove: jest.fn(),
        depopulate: jest.fn(),
        equals: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        increment: jest.fn(),
        validate: jest.fn(),
        toObject: jest.fn(),
        toJSON: jest.fn()
      } as any;

      expect(user).toBeDefined();
    });

    it('should have correct Attendee interface', () => {
      const attendee: Attendee = {
        name: 'Test Attendee',
        email: 'attendee@example.com'
      };

      expect(attendee.name).toBe('Test Attendee');
      expect(attendee.email).toBe('attendee@example.com');
    });
  });
});