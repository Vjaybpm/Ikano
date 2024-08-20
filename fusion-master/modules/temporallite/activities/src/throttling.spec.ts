import { startIncrementLoop, withThrottle } from "./throttling";

let globalCount = 0;

function incrementCount () {
  return new Promise<void> ( ( resolve ) => {
    globalCount++;
    resolve ();
  } );
}
describe ( 'throttle testing', () => {
  test ( 'throttle behavior under load', async () => {
    jest.useRealTimers();
    const throttle = {
      current: 5,
      max: 5,
      tokensPer100ms: 1,
      throttlingDelay: 50, // Short delay for test speedup
      kill: false
    };

    // Create a bunch of promises
    const promises = [];
    for ( let i = 0; i < 9; i++ ) {
      const p = withThrottle ( throttle, incrementCount );
      promises.push ( p () );
    }

    // Initial check: should execute only 5 initially due to throttle limit
    await new Promise ( r => setTimeout ( r, 200 ) ); // Wait to let initial promises resolve
    expect ( globalCount ).toBe ( 5 );
    console.log('globalCount', globalCount);

    // Wait 100ms and check no new increments
    await new Promise ( r => setTimeout ( r, 100 ) );
    expect ( globalCount ).toBe ( 5 );
    console.log('globalCount -2 ', globalCount);
    expect ( throttle.current ).toBe ( 0 );

    // Reset the count to allow more executions
    throttle.current = 5;

    // Check if four more are allowed (total 9)
    await new Promise ( r => setTimeout ( r, 200 ) ); // Allow time for more executions
    console.log('globalCount -3 ', globalCount);
    expect ( globalCount ).toBe ( 9 );
    expect ( throttle.current ).toBe ( 1 ); // One token should be left as we added 5 and allowed 4 more executions
  } );
} );
describe('startIncrementLoop', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });


  test('should increment throttle.current periodically', () => {
    const throttle = {
      current: 0,
      max: 10,
      tokensPer100ms: 1,
      throttlingDelay: 50,
      kill: false
    };

    startIncrementLoop(throttle);

    // Fast-forward time to 500ms
    jest.advanceTimersByTime(500);

    // Check if the current has incremented correctly
    expect(throttle.current).toBe(5); // 5 increments over 500ms, assuming it starts from 0

    // Test kill switch
    throttle.kill = true;
    jest.advanceTimersByTime(100); // move time forward to check if it stops incrementing
    expect(throttle.current).toBe(5); // Should remain the same if kill works
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});
