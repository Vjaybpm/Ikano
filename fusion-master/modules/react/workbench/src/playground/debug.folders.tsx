import { UrlFolder } from "@itsmworkbench/urlstore";
import { LensProps } from "@focuson/state";
import { convertUrlFolderToFileExplorer, FileExplorer } from "@fusionconfig/react_explorer";


export function DebugFolders<S> ( { state }: LensProps<S, UrlFolder, any> ) {
  let folders = state.optJson ();
  if ( !folders ) return <div>loading...</div>
  const ids: string[] = []
  const fileOrFolderDetails = convertUrlFolderToFileExplorer ( folders, ids );
  return <FileExplorer expandIds={ids} items={[ fileOrFolderDetails ]}/>
}