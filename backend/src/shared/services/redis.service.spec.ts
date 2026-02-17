import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { jest } from '@jest/globals';

// Mock the redis module
jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

describe('RedisService', () => {
  let service: RedisService;
  let mockRedisClient: {
    connect: jest.Mock;
    quit: jest.Mock;
    disconnect: jest.Mock;
    isOpen: boolean;
    isReady: boolean;
  };

  beforeEach(async () => { 
    // Create mock Redis client with all necessary methods
    mockRedisClient = {
      connect: jest.fn(async () => await undefined),
      quit: jest.fn(async () => await undefined),
      disconnect: jest.fn(async () => await undefined),
      isOpen: true,
      isReady: true,
    };

    // Mock createClient to return our mock client
    (createClient as jest.MockedFunction<typeof createClient>).mockReturnValue(
      mockRedisClient as unknown as ReturnType<typeof createClient>,
    );

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
      mockRedisClient.connect.mockImplementationOnce(async () => {
        throw error;
      });

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit Redis connection on module destruction', async () => {
      await service.onModuleDestroy();

      expect(mockRedisClient.quit).toHaveBeenCalledTimes(1);
    });

    it('should handle quit errors', async () => {
      const error = new Error('Quit failed');
      mockRedisClient.quit.mockImplementationOnce(async () => {
        throw error;
      });

      await expect(service.onModuleDestroy()).rejects.toThrow('Quit failed');
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

      await service.onModuleDestroy();
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });
});
