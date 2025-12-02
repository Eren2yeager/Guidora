/**
 * @jest-environment node
 */

// Mock dependencies BEFORE imports
jest.mock('@/lib/mongodb.js', () => jest.fn());
jest.mock('@/models/College.js', () => ({
  countDocuments: jest.fn(),
}));
jest.mock('@/models/Course.js', () => ({
  countDocuments: jest.fn(),
}));
jest.mock('@/models/Scholarship.js', () => ({
  countDocuments: jest.fn(),
}));

import { GET } from '../route';
import connectDB from '@/lib/mongodb.js';
import College from '@/models/College.js';
import Course from '@/models/Course.js';
import Scholarship from '@/models/Scholarship.js';

describe('GET /api/statistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns statistics successfully', async () => {
    // Mock database connection
    connectDB.mockResolvedValue(true);

    // Mock model counts
    College.countDocuments = jest.fn().mockResolvedValue(500);
    Course.countDocuments = jest.fn().mockResolvedValue(1000);
    Scholarship.countDocuments = jest.fn().mockResolvedValue(100);

    const response = await GET();
    const data = await response.json();

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(College.countDocuments).toHaveBeenCalledWith({ isActive: true });
    expect(Course.countDocuments).toHaveBeenCalledWith({ isActive: true });
    expect(Scholarship.countDocuments).toHaveBeenCalledWith({ isActive: true });

    expect(data).toEqual({
      colleges: 500,
      courses: 1000,
      scholarships: 100,
    });
    expect(response.status).toBe(200);
  });

  it('returns zero counts when no documents exist', async () => {
    connectDB.mockResolvedValue(true);
    College.countDocuments = jest.fn().mockResolvedValue(0);
    Course.countDocuments = jest.fn().mockResolvedValue(0);
    Scholarship.countDocuments = jest.fn().mockResolvedValue(0);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({
      colleges: 0,
      courses: 0,
      scholarships: 0,
    });
  });

  it('handles database connection error', async () => {
    connectDB.mockRejectedValue(new Error('Database connection failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch statistics',
    });
  });

  it('handles College model error', async () => {
    connectDB.mockResolvedValue(true);
    College.countDocuments = jest.fn().mockRejectedValue(new Error('College query failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch statistics',
    });
  });

  it('handles Course model error', async () => {
    connectDB.mockResolvedValue(true);
    College.countDocuments = jest.fn().mockResolvedValue(500);
    Course.countDocuments = jest.fn().mockRejectedValue(new Error('Course query failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch statistics',
    });
  });

  it('handles Scholarship model error', async () => {
    connectDB.mockResolvedValue(true);
    College.countDocuments = jest.fn().mockResolvedValue(500);
    Course.countDocuments = jest.fn().mockResolvedValue(1000);
    Scholarship.countDocuments = jest.fn().mockRejectedValue(new Error('Scholarship query failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch statistics',
    });
  });

  it('executes queries in parallel using Promise.all', async () => {
    connectDB.mockResolvedValue(true);
    
    const collegePromise = Promise.resolve(500);
    const coursePromise = Promise.resolve(1000);
    const scholarshipPromise = Promise.resolve(100);

    College.countDocuments = jest.fn().mockReturnValue(collegePromise);
    Course.countDocuments = jest.fn().mockReturnValue(coursePromise);
    Scholarship.countDocuments = jest.fn().mockReturnValue(scholarshipPromise);

    await GET();

    // All three should be called before any resolves
    expect(College.countDocuments).toHaveBeenCalled();
    expect(Course.countDocuments).toHaveBeenCalled();
    expect(Scholarship.countDocuments).toHaveBeenCalled();
  });
});
