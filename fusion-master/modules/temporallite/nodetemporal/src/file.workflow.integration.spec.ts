import { activity, ActivityEvents } from "@fusionconfig/activities";

import { NameAnd } from "@laoban/utils";
import { fileWorkflowEngine } from "./file.workflow.engine";
import {  defaultFileNamesForTemporal } from "./filenames";
import { workflow, WorkflowEngine } from "@fusionconfig/workflow";
import { createTempDir, removeTempDir } from "./filenames.fixtures";

const timeService = (): number => Date.UTC ( 2024, 3, 27, 14, 30, 0 );

function names ( workspace: string ) {
  return defaultFileNamesForTemporal ( { timeService, workspace, template: '{seq}.events' } )
}
export const activityAddOne = activity ( { id: 'addone' },
  async ( input: number ): Promise<number> => input + 1 )
export const activityAddFour = activity ( { id: 'addfour' },
  async ( input: number ): Promise<number> => input + 4 )
export const activityAddEight = activity ( { id: 'addeight' },
  async ( input: number ): Promise<number> => input + 8 )
export const wfAdd13 = workflow ( { id: 'wfAdd13' },
  async ( i: number ) => activityAddOne ( await activityAddFour ( await activityAddEight ( i ) ) ) )

describe ( "workflow", () => {
  let workspace: string
  beforeEach ( async () => {
    workspace = await createTempDir ();
  } );

  afterEach ( async () => {
    console.log('workspace', workspace)
    // await removeTempDir ( workspace );
  } );

  it ( 'should execute a workflow', async () => {
    const engine: WorkflowEngine = fileWorkflowEngine ( names( workspace) );
    const result = await wfAdd13 ( engine, 2 )

    expect ( result ).toBe ( 15 )

  } )
  it ( "should continue a workflow from a previous state when more work to do 1 ", async () => {
    const store: ActivityEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = fileWorkflowEngine ( names( workspace), 'instanceId' );

    const result = await wfAdd13 ( engine, 2 ) //this should be a continue command not a start command

    expect ( result ).toBe ( 15 )
    expect ( store ).toEqual ( [
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 }
    ] )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 2,
      "activity.replay.success": 1,
      "activity.success": 2
    } )
  } )
  it ( "should continue a workflow from a previous state when more work to do 2 ", async () => {
    const store: ActivityEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = fileWorkflowEngine ( names( workspace) );
    const result = await wfAdd13 ( engine, 2 )

    expect ( result ).toBe ( 15 )
    expect ( store ).toEqual ( [ { "id": "addone", "success": 15 } ] )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 1,
      "activity.replay.success": 2,
      "activity.success": 1
    } )
  } )
  it ( "should continue a workflow from a previous state when no more work", async () => {
    const store: ActivityEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = fileWorkflowEngine ( names( workspace) );
    const result = await wfAdd13 ( engine, 2 )

    expect ( result ).toBe ( 15 )
    expect ( store ).toEqual ( [] )
    expect ( metrics ).toEqual ( {
      "activity.replay.success": 3
    } )
  } )
} )