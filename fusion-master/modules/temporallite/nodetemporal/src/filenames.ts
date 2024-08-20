import fs from "fs";
import path from "node:path";
import { removeLastExtension, simpleTemplate } from "@fusionconfig/utils";
import { NextInstanceIdFn } from "@fusionconfig/workflow";


//export type IncMetricFn = ( workflowInstanceId: string ) => IncMetric
// export type SideeffectFn = ( workflowInstanceId: string ) => Sideeffect
// export type NextInstanceIdFn = ( workflowId: string ) => Promise<string>
// export type ExistingStateFn = ( workflowInstanceId: string ) => Promise<ActivityEvents>
// export type UpdateEventHistoryFn = ( workflowInstanceId: string ) => ( e: ActivityEvent ) => Promise<void>
export type FileNamesForTemporal = {
  nextInstanceId: NextInstanceIdFn,
  metrics: ( workflowInstanceId: string ) => string
  eventHistory: ( workflowInstanceId: string ) => string
}
export type InstanceNameConfig = {
  timeService: TimeService
  workspace: string
  template: string
}
export function defaultFileNamesForTemporal ( config: InstanceNameConfig ): FileNamesForTemporal {
  return {
    nextInstanceId: fileNextInstanceId ( config ),
    metrics: ( workflowInstanceId: string ) => `${config.workspace}/metrics/${workflowInstanceId}.metrics`,
    eventHistory: ( workflowInstanceId: string ) => `${config.workspace}/${workflowInstanceId}.events`
  }
}

type TimeService = () => number;

/**
 * Generates a root filename based on the provided time.
 * @param {TimeService} timeService - Function that returns the current time as a number.
 * @returns {string} - Root part of the filename.
 */
export function getRootWorkspaceInstanceName ( timeService: TimeService, workflowId: string ): string {
  const now = new Date ( timeService () );
  const year = now.getUTCFullYear (); // Gets the year according to universal time.
  const month = (now.getUTCMonth () + 1).toString ().padStart ( 2, '0' ); // getUTCMonth() is zero-indexed, add 1 to align with human-readable months.
  const date = now.getUTCDate ().toString ().padStart ( 2, '0' ); // Gets the day (date) of the month according to universal time.
  const hour = now.getUTCHours ().toString ().padStart ( 2, '0' ); // Gets the hour according to universal time.
  const minute = now.getUTCMinutes ().toString ().padStart ( 2, '0' ); // Gets the minutes according to universal time.


  return `${workflowId}/${year}-${month}/${date}-${hour}/${minute}`;
}
async function generateUniqueSequence ( dirPath: string, template: string ): Promise<string> {
  let sequenceNumber = (await fs.promises.readdir ( dirPath )).length + Math.floor ( Math.random () * 4 );
  while ( true ) {
    const filename = simpleTemplate ( template, { seq: sequenceNumber } );
    const filePath = path.join ( dirPath, filename );

    try {
      // Attempt to create the file. If the file does not exist, it will be created.
      await fs.promises.writeFile ( filePath, '', { flag: 'wx' } );
      return removeLastExtension ( filename );
    } catch ( error ) {
      if ( error.code === 'EEXIST' ) {
        // If the file already exists, increment the sequence number and try again.
        sequenceNumber += Math.floor ( Math.random () * 4 ) + 1;
      } else {
        // Rethrow any other error which we are not expecting.
        throw error;
      }
    }
  }
}


export const fileNextInstanceId = ( config: InstanceNameConfig ) => async ( workflowId: string ) => {
  const { timeService, workspace, template } = config;
  const root = getRootWorkspaceInstanceName ( timeService, workflowId );
  const dirPath = path.join ( workspace, root );

  await fs.promises.mkdir ( dirPath, { recursive: true } );
  return path.join ( root, await generateUniqueSequence ( dirPath, template ) );
};

