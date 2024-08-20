import { activity } from "./activities";
import { ActivityEvents } from "./activity.events";
import { runWithWorkflowHookState, workflowHookStateForTest } from "./async.hooks";
import { NameAnd } from "@laoban/utils";


export const addOneA = activity ( { id: 'addone' }, async ( input: number ): Promise<number> => input + 1 )

describe ( "activity", () => {
  it ( "should have the config", () => {
    expect ( addOneA.config.id ).toBe ( 'addone' )
  } )
  it ( "should have the raw function", () => {
    expect ( addOneA.raw ( 1 ) ).resolves.toBe ( 2 )
  } )
  it ( 'should execute if there is a workflowHookState', async () => {
    const store: ActivityEvents = []
    let metrics: NameAnd<number> = {};
    const state = workflowHookStateForTest ( store, metrics );
    const result = await runWithWorkflowHookState ( state,
      () => addOneA ( 1 ) )
    expect ( result ).toBe ( 2 )
    expect ( store ).toEqual ( [ { id: 'addone', success: 2 } ] )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 1,
      "activity.success": 1
    } )
  } )
  it ( "should keep retrying until it succeeds if there is a suitable retry policy", async () => {
    let addOneErrorCount = 0
    const addOneAErrorFourTimes = activity ( {
      id: 'addOneError',
      retry: { initialInterval: 10, maximumInterval: 20, maximumAttempts: 5 }
    }, async ( input: number ): Promise<number> => {
      if ( addOneErrorCount++ < 4 ) throw new Error ( 'addOneError: ' + addOneErrorCount )
      return input + 1;
    } )
    const store: ActivityEvents = []
    const metrics: NameAnd<number> = {}
    const state = workflowHookStateForTest ( store, metrics );
    const result = await runWithWorkflowHookState ( state, () => addOneAErrorFourTimes ( 1 ) )
    expect ( result ).toBe ( 2 )
    expect ( store ).toEqual ( [
      { id: 'addOneError', success: 2 }
    ] )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 5,
      "activity.retry[1]": 1,
      "activity.retry[2]": 1,
      "activity.retry[3]": 1,
      "activity.retry[4]": 1,
      "activity.success": 1
    } )
  } )
} )