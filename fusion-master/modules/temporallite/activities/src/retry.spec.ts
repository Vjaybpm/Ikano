import { withRetry } from "./retry";
import { runWithWorkflowHookState } from "./async.hooks";
import { NameAnd } from "@laoban/utils";
import { inMemoryIncMetric } from "./metrics";


describe ( 'withRetry', () => {

  const metrics: NameAnd<number> = {}
  const incMetric = inMemoryIncMetric ( metrics )
  beforeEach ( () => {
    for ( const key in metrics ) delete metrics[ key ]
  } );
  test ( 'should succeed on the first try', async () => {
    const fetchData = jest.fn ( () => Promise.resolve ( 'Data' ) );
    const retryConfig = {
      initialInterval: 10, // ms
      maximumInterval: 20, // ms
      maximumAttempts: 3
    };
    const fetchDataWithRetry = withRetry ( retryConfig, fetchData );
    const result = await runWithWorkflowHookState ( { incMetric } as any, fetchDataWithRetry );

    expect ( fetchData ).toHaveBeenCalledTimes ( 1 );
    expect ( result ).toBe ( 'Data' );
    expect ( metrics ).toEqual ( { 'activity.attempts': 1, 'activity.success': 1 } )
  } );

  test ( 'should fail once then succeed on the second try', async () => {
    const fetchData = jest.fn ()
      .mockRejectedValueOnce ( new Error ( 'Network error' ) )
      .mockResolvedValue ( 'Data' );

    const retryConfig = {
      initialInterval: 10, // ms
      maximumInterval: 20, // ms
      maximumAttempts: 3
    };

    const fetchDataWithRetry = withRetry ( retryConfig, fetchData );
    const result = await runWithWorkflowHookState ( { incMetric } as any, fetchDataWithRetry );

    expect ( fetchData ).toHaveBeenCalledTimes ( 2 ); // Should be called twice: fail then succeed
    expect ( result ).toBe ( 'Data' );
    expect ( metrics ).toEqual ( { 'activity.attempts': 2, 'activity.retry[1]': 1, 'activity.success': 1 } )
  } );

  test ( 'should fail after maximum attempts', async () => {
    const fetchData = jest.fn ( () => Promise.reject ( new Error ( 'Network error' ) ) );
    const retryConfig = {
      initialInterval: 10, // ms
      maximumInterval: 20, // ms
      maximumAttempts: 3
    };

    const fetchDataWithRetry = withRetry ( retryConfig, fetchData );

    const result = runWithWorkflowHookState ( { incMetric } as any, fetchDataWithRetry );


    await expect ( result ).rejects.toThrow ( 'Network error' );
    expect ( fetchData ).toHaveBeenCalledTimes ( 3 ); // Should be called three times
    expect ( metrics ).toEqual ( {
      "activity.attempts": 3,
      "activity.error_max_attempts": 1,
      "activity.retry[1]": 1,
      "activity.retry[2]": 1
    } )
  } );
  test ( 'should not retry on non-recoverable errors and should immediately rethrow', async () => {
    // Define the function that will be retried
    const fn = jest.fn ();
    fn.mockRejectedValueOnce ( new Error ( "Fatal error" ) );

    // Define the retry policy
    const retryPolicy = {
      initialInterval: 100,
      maximumInterval: 1000,
      maximumAttempts: 3,
      nonRecoverableErrors: [ "Fatal error" ]
    };

    // Create the retry wrapper
    const retryFn = withRetry ( retryPolicy, fn );
    const result = runWithWorkflowHookState ( { incMetric } as any, retryFn );

    // Expect the function to throw the non-recoverable error
    await expect ( result ).rejects.toThrow ( "Fatal error" );

    // Ensure the function is not retried
    expect ( fn ).toHaveBeenCalledTimes ( 1 );
    expect ( metrics ).toEqual ( { 'activity.attempts': 1, 'activity.non_recoverable_error': 1 } )
  } );
} )

