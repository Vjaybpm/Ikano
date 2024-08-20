import fs from "fs";
import { ActivityEvents } from "@fusionconfig/activities";
import { FileNamesForTemporal } from "./filenames";
import { NameAnd } from "@laoban/utils";
import * as os from "os";

export async function createTempDir () {
  // let prefix = os.tmpdir () + "/filenames";
  let prefix =  "target/";
  await fs.promises.mkdir ( prefix, { recursive: true } );
  return await fs.promises.mkdtemp ( prefix, { encoding: 'utf8' } );
}

export async function removeTempDir ( dir ) {
  await fs.promises.rm ( dir, { recursive: true } );
}

export function setEvents ( names: FileNamesForTemporal, workspaceInstanceId: string, events: ActivityEvents ) {
  const file = names.eventHistory ( workspaceInstanceId );
  return fs.promises.writeFile ( file, events.map ( e => JSON.stringify ( e ) ).join ( '\n' ) )
}

export function loadEvents ( names: FileNamesForTemporal, workspaceInstanceId: string ): Promise<ActivityEvents> {
  const file = names.eventHistory ( workspaceInstanceId );
  return fs.promises.readFile ( file, 'utf8' ).then ( data => data.split ( '\n' ).filter ( x => x !== '' ).map ( x => JSON.parse ( x ) ) )
}
export function loadMetrics ( names: FileNamesForTemporal, workspaceInstanceId: string ): Promise<NameAnd<number>> {
  const file = names.metrics ( workspaceInstanceId );
  return fs.promises.readFile ( file, 'utf8' ).then ( data => JSON.parse ( data ) )
}