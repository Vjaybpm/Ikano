import { CallStatus, defaultCacheCleanup, defaultCacheExecuteAsync, defaultCacheFound, defaultCacheSearch, FutureCache, futureCache, getOrUpdateFromFutureCache } from "./future.cache";
import { callListeners } from "@itsmworkbench/utils";

let cs1 = { context: 'context1', params: [ 1, 2, 3 ], value: Promise.resolve ( 'value1' ), time: 1000 };
let cs2 = { context: 'context2', params: [ 4, 5, 6 ], value: Promise.resolve ( 'value2' ), time: 2000 };
describe ( 'defaultCacheSearch', () => {
  beforeEach ( () => {
    cs1.time = 1000
    cs2.time = 2000
  } )

  it ( 'should return the correct cache entry when a matching one exists', () => {
    const cacheSearch = defaultCacheSearch<string> ();
    const cache: CallStatus<string>[] = [ cs1, cs2, ];
    const context = 'context1';
    const params = [ 1, 2, 3 ];

    const result = cacheSearch ( cache, context, params );
    expect ( result ).toBe ( cs1 );
  } );


  it ( 'should return undefined when no matching cache entry exists', () => {
    const cacheSearch = defaultCacheSearch ();
    const cache: CallStatus<string>[] = [ cs1, cs2, ];
    const context = 'context3';
    const params = [ 7, 8, 9 ];

    const result = cacheSearch ( cache, context, params );

    expect ( result ).toBeUndefined ();
  } );

  it ( 'should return undefined if parameters do not match', () => {
    const cacheSearch = defaultCacheSearch ();
    const cache: CallStatus<string>[] = [ cs1, cs2, ];
    const context = 'context1';
    const params = [ 1, 2, 4 ];  // Slightly different parameters

    const result = cacheSearch ( cache, context, params );

    expect ( result ).toBeUndefined ();
  } );
} );


export const emptyCache =futureCache<string>()
describe('defaultCacheCleanup', () => {
  it('should remove expired cache entries based on TTL', () => {
    // Current time is 10000, TTL is 2000, so threshold time is 8000
    const mockTimeService = () => 10000;
    const ttl = 2000;
    const mockCache = {...emptyCache,
      timeService: mockTimeService,
      ttl: ttl,
      cache: [
        { context: 'context1', params: [1], value: Promise.resolve('value1'), time: 7999 }, // should be removed
        { context: 'context2', params: [2], value: Promise.resolve('value2'), time: 8000 }, // should remain
        { context: 'context3', params: [3], value: Promise.resolve('value3'), time: 8001 }, // should remain
      ]
    };

    const cleanup = defaultCacheCleanup();
    const result = cleanup(mockCache);

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ context: 'context2', time: 8000 }),
      expect.objectContaining({ context: 'context3', time: 8001 })
    ]));
    expect(result.length).toBe(2); // Expect only two items to remain
  });

  it('should retain all entries if none are past the TTL', () => {
    const mockTimeService = () => 10000;
    const ttl = 5000;
    const mockCache:FutureCache<string> = {...emptyCache,
      timeService: mockTimeService,
      ttl: ttl,
      cache: [
        { context: 'context1', params: [1], value: Promise.resolve('value1'), time: 6000 },
        { context: 'context2', params: [2], value: Promise.resolve('value2'), time: 7000 },
      ]
    };

    const cleanup = defaultCacheCleanup();
    const result = cleanup(mockCache);

    expect(result.length).toBe(2); // No entries should be removed
  });

  it('should return an empty array if all entries are expired', () => {
    const mockTimeService = () => 10000;
    const ttl = 1000;
    const mockCache:FutureCache<string> = {...emptyCache,
      timeService: mockTimeService,
      ttl: ttl,
      cache: [
        { context: 'context1', params: [1], value: Promise.resolve('value1'), time: 8000 }, // Expired
        { context: 'context2', params: [2], value: Promise.resolve('value2'), time: 8500 }, // Expired
      ]
    };

    const cleanup = defaultCacheCleanup();
    const result = cleanup(mockCache);

    expect(result.length).toBe(0); // All entries should be removed
  });
});


jest.mock('@itsmworkbench/utils', () => ({
  callListeners: jest.fn()
}));

describe('defaultCacheExecuteAsync', () => {
  it('should call raw and handle result correctly', async () => {
    const raw = jest.fn().mockResolvedValue('result'); // Mock raw function resolves to 'result'
    const cache = {...emptyCache,
      listeners: []
    };
    const context = 'testContext';
    const params = [1, 2, 3];

    const executeAsync = defaultCacheExecuteAsync();
    const result = await executeAsync(cache, context, params, raw);

    expect(result).toBe('result');
    expect(raw).toHaveBeenCalledWith(params);
    expect(callListeners).toHaveBeenCalledWith(cache.listeners, 'callingLoad', expect.any(Function));
    expect(callListeners).toHaveBeenCalledWith(cache.listeners, 'loadArrived', expect.any(Function));
  });

  it('should call raw and handle error correctly', async () => {
    const error = new Error('Failed');
    const raw = jest.fn().mockRejectedValue(error); // Mock raw function rejects with an error
    const cache = {...emptyCache,
      listeners: []
    };
    const context = 'testContext';
    const params = [1, 2, 3];

    const executeAsync = defaultCacheExecuteAsync();

    await expect(executeAsync(cache, context, params, raw)).rejects.toThrow('Failed');

    expect(raw).toHaveBeenCalledWith(params);
    expect(callListeners).toHaveBeenCalledWith(cache.listeners, 'callingLoad', expect.any(Function));
    expect(callListeners).toHaveBeenCalledWith(cache.listeners, 'loadError', expect.any(Function));
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks to ensure clean state for each test
  });
});

describe('defaultCacheFound', () => {
  it('should update the cache entry time and notify listeners', () => {
    const mockTimeService = jest.fn().mockReturnValue(123456789);  // Mocked time service
    const cache = {...emptyCache,
      listeners: [],
      timeService: mockTimeService
    };
    const context = 'testContext';
    const found = {
      context: 'testContext',
      params: [1, 2, 3],
      value: Promise.resolve('foundValue'),
      time: 0  // Initial time
    };

    const cacheFound = defaultCacheFound();
    const result = cacheFound(cache, context, found);

    // Expect the found time to be updated
    expect(found.time).toBe(123456789);
    // Expect the result to be the found value
    expect(result).toBe(found.value);
    // Check that the listeners were notified correctly
    expect(callListeners).toHaveBeenCalledWith(cache.listeners, 'duplicateCall', expect.any(Function));
    // Verify that the timeService was called to get the current time
    expect(mockTimeService).toHaveBeenCalled();
  });
});

describe('getOrUpdateFromFutureCache', () => {
  const timeService = () => Date.now();  // Simple current time service
  let cache;

  beforeEach(() => {
    cache = {...emptyCache,
      ttl: 10000,
      timeService,
      cache: [],
      listeners: [],
      found: (cache, context, found) => found.value,
      execute: async (cache, context, params, raw) => raw(params)
    };
  });

  it('should return existing data if found', async () => {
    const existingEntry = {
      context: 'test',
      params: [1, 2, 3],
      value: Promise.resolve('existing data'),
      time: timeService()
    };
    cache.cache.push(existingEntry);

    const result = await getOrUpdateFromFutureCache(cache, 'test', [1, 2, 3], () => Promise.resolve('new data'));

    expect(await result).toBe('existing data');
  });

  it('should fetch new data if not found', async () => {
    const raw = jest.fn().mockResolvedValue('new data'); // Using jest.fn() here for the raw function to check if it was called
    const result = await getOrUpdateFromFutureCache(cache, 'test', [1, 2, 3], raw);

    expect(await result).toBe('new data');
    expect(raw).toHaveBeenCalledWith([1, 2, 3]);
    expect(cache.cache.length).toBe(1); // Check if new data was pushed to the cache
  });

  it('should clean up old entries before fetching new data', async () => {
    const oldEntry = {
      context: 'test',
      params: [4, 5, 6],
      value: Promise.resolve('old data'),
      time: timeService() - 20000 // An old timestamp outside the TTL
    };
    cache.cache.push(oldEntry);

    const result = await getOrUpdateFromFutureCache(cache, 'test', [1, 2, 3], () => Promise.resolve('new data'));

    expect(await result).toBe('new data');
    expect(cache.cache.length).toBe(1); // Old entry should be removed, new one should be added
    expect(cache.cache[0].params).toEqual([1, 2, 3]); // Ensure it's the new data
  });
});
