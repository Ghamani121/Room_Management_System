import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { connectToDB } from '../db'; // Update with correct path
import User from "../../models/user";
import Room from '../../models/room';

// Mock dependencies
jest.mock('mongoose');
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock the models with proper structure
jest.mock('../../models/user', () => ({
  syncIndexes: jest.fn()
}));

jest.mock('../../models/room', () => ({
  syncIndexes: jest.fn()
}));

describe('connectToDB', () => {
  let originalExit: typeof process.exit;
  let originalEnv: NodeJS.ProcessEnv;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Store original values
    originalExit = process.exit;
    originalEnv = { ...process.env };
    
    // Mock process.exit
    process.exit = jest.fn() as unknown as typeof process.exit;
    
    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    process.exit = originalExit;
    process.env = originalEnv;
    
    // Restore console spies
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should connect to MongoDB successfully and sync indexes', async () => {
    // Setup
    process.env.DATABASE_URL = 'mongodb://localhost:27017/testdb';
    
    // Mock successful connection
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);
    
    // Mock successful index syncing
    (Room.syncIndexes as jest.Mock).mockResolvedValue(undefined);
    (User.syncIndexes as jest.Mock).mockResolvedValue(undefined);

    // Execute
    await connectToDB();

    // Verify
    expect(dotenv.config).toHaveBeenCalled();
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/testdb');
    expect(Room.syncIndexes).toHaveBeenCalled();
    expect(User.syncIndexes).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith('Connected to MongoDB');
    expect(consoleLogSpy).toHaveBeenCalledWith('Indexes synced');
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should handle MongoDB connection error and exit process', async () => {
    // Setup
    process.env.DATABASE_URL = 'mongodb://localhost:27017/testdb';
    const connectionError = new Error('Connection failed');
    
    // Mock failed connection
    (mongoose.connect as jest.Mock).mockRejectedValue(connectionError);

    // Execute
    await connectToDB();

    // Verify
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/testdb');
    expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', 'Connection failed');
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(Room.syncIndexes).not.toHaveBeenCalled();
    expect(User.syncIndexes).not.toHaveBeenCalled();
  });

  it('should handle index syncing errors but continue', async () => {
    // Setup
    process.env.DATABASE_URL = 'mongodb://localhost:27017/testdb';
    const syncError = new Error('Index sync failed');
    
    // Mock successful connection but failed index sync
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);
    (Room.syncIndexes as jest.Mock).mockRejectedValue(syncError);
    (User.syncIndexes as jest.Mock).mockResolvedValue(undefined);

    // Execute
    await connectToDB();

    // Verify
    expect(mongoose.connect).toHaveBeenCalled();
    expect(Room.syncIndexes).toHaveBeenCalled();
    expect(User.syncIndexes).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith('Connected to MongoDB');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error syncing indexes:', syncError);
    expect(consoleLogSpy).toHaveBeenCalledWith('Indexes synced');
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should handle both Room and User index syncing errors but continue', async () => {
    // Setup
    process.env.DATABASE_URL = 'mongodb://localhost:27017/testdb';
    const roomSyncError = new Error('Room index sync failed');
    const userSyncError = new Error('User index sync failed');
    
    // Mock successful connection but failed index sync for both
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);
    (Room.syncIndexes as jest.Mock).mockRejectedValue(roomSyncError);
    (User.syncIndexes as jest.Mock).mockRejectedValue(userSyncError);

    // Execute
    await connectToDB();

    // Verify
    expect(mongoose.connect).toHaveBeenCalled();
    expect(Room.syncIndexes).toHaveBeenCalled();
    expect(User.syncIndexes).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith('Connected to MongoDB');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error syncing indexes:', roomSyncError);
    expect(consoleLogSpy).toHaveBeenCalledWith('Indexes synced');
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should use the DATABASE_URL from environment variables', async () => {
    // Setup
    const testDbUrl = 'mongodb://test:test@localhost:27017/testdb';
    process.env.DATABASE_URL = testDbUrl;
    
    // Mock successful connection and index syncing
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);
    (Room.syncIndexes as jest.Mock).mockResolvedValue(undefined);
    (User.syncIndexes as jest.Mock).mockResolvedValue(undefined);

    // Execute
    await connectToDB();

    // Verify
    expect(mongoose.connect).toHaveBeenCalledWith(testDbUrl);
  });

  it('should handle undefined DATABASE_URL and exit process', async () => {
    // Setup - clear DATABASE_URL
    delete process.env.DATABASE_URL;
    
    // Mock connection will fail due to undefined URL
    (mongoose.connect as jest.Mock).mockRejectedValue(new Error('Invalid connection string'));

    // Execute
    await connectToDB();

    // Verify
    expect(mongoose.connect).toHaveBeenCalledWith(undefined as unknown as string);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should handle specific model sync errors individually', async () => {
    // Setup
    process.env.DATABASE_URL = 'mongodb://localhost:27017/testdb';
    const roomError = new Error('Room sync failed');
    
    // Mock successful connection, Room fails but User succeeds
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);
    (Room.syncIndexes as jest.Mock).mockRejectedValue(roomError);
    (User.syncIndexes as jest.Mock).mockResolvedValue(undefined);

    // Execute
    await connectToDB();

    // Verify
    expect(Room.syncIndexes).toHaveBeenCalled();
    expect(User.syncIndexes).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error syncing indexes:', roomError);
    expect(consoleLogSpy).toHaveBeenCalledWith('Indexes synced'); // Still logs success
  });
});