import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { jest } from '@jest/globals';

// Mock @keyv/redis module
jest.mock('@keyv/redis', () => ({
  createClient: jest.fn(),
}));

describe('RedisService', () => {
  let service: RedisService;
  let mockRedisClient: {
    connect: jest.Mock;
    destroy: jest.Mock;
  };

  beforeEach(async () => { 
    // Create mock Redis client with all necessary methods
    mockRedisClient = {
      connect: jest.fn(),
      destroy: jest.fn(),
    };

    // Get the mocked createClient and make it return our mock
    const { createClient } = require('@keyv/redis');
    createClient.mockReturnValue(mockRedisClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to Redis on module initialization', async () => {
      await service.onModuleInit();

      expect(mockRedisClient.connect).toHaveBeenCalledTimes(1);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      mockRedisClient.connect.mockImplementationOnce(() => {
        throw error;
      });
      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('onModuleDestroy', () => {
    it('should destroy Redis connection on module destruction', () => {
      service.onModuleDestroy();

      expect(mockRedisClient.destroy).toHaveBeenCalledTimes(1);
    });

    it('should handle destroy errors', () => {
      const error = new Error('Destroy failed');
      mockRedisClient.destroy.mockImplementationOnce(() => {
        throw error;
      });

      expect(() => service.onModuleDestroy()).toThrow('Destroy failed');
    });
  });

  describe('getClient', () => {
    it('should return the Redis client', () => {
      const client = service.getClient();

      expect(client).toBe(mockRedisClient);
    });

    it('should return the same client instance on multiple calls', () => {
      const client1 = service.getClient();
      const client2 = service.getClient();

      expect(client1).toBe(client2);
    });
  });

  describe('Redis client creation', () => {
    it('should create Redis client with correct URL from environment', () => {
      const { createClient } = require('@keyv/redis');
      expect(createClient).toHaveBeenCalledWith({
        url: process.env.REDIS_URL,
      });
    });
  });

  describe('Integration lifecycle', () => {
    it('should properly initialize and destroy', async () => {
      await service.onModuleInit();
      expect(mockRedisClient.connect).toHaveBeenCalled();

      const client = service.getClient();
      expect(client).toBe(mockRedisClient);

      service.onModuleDestroy();
      expect(mockRedisClient.destroy).toHaveBeenCalled();
    });
  });
});
