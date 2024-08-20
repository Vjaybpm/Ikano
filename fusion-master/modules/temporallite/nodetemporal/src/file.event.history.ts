import { ActivityEvent } from "@fusionconfig/activities";
import fs from "fs";
import { FileNamesForTemporal } from "./filenames";


export const fileUpdateEventHistory = ( names: FileNamesForTemporal ) => ( workflowId: string ) => {
  const file = names.eventHistory ( workflowId );
  return ( e: ActivityEvent ) => fs.promises.appendFile ( file, `${JSON.stringify ( e )}\n` );
};


//TODO lots more work here. Have to deal with corruption and recover from the corruption
export const fileExistingState = ( names: FileNamesForTemporal ) => async ( workflowId: string ): Promise<ActivityEvent[]> => {
  const file = names.eventHistory ( workflowId );
  try {
    const data = await fs.promises.readFile ( file, 'utf8' );
    return data.split ( '\n' ).filter ( x => x !== '' ).map ( x => JSON.parse ( x ));
  } catch ( e ) {
    if ( e.code === 'ENOENT' ) return [];
    throw e;
  }
};