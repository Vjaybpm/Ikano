import { LensProps } from "@focuson/state";
import { Paper, Typography } from "@mui/material";
import React from "react";

export type FilesDetailsProps<S> = LensProps<S, string, any>

export function findLines ( file: string | undefined ) {
  const index = file?.indexOf ( 'version' )
  if ( file === undefined || index === undefined || index === -1 ) return { foundLines: [], notFoundLines: [] }
  const header = file.slice ( 0, index )
  const notFoundIndex = header.indexOf ( 'Files not found' )
  const found = header.slice ( 0, notFoundIndex )
  const notFound = header.slice ( notFoundIndex )
  function parse ( header: string ) {
    const lines = header.split ( '\n' )
      .map ( s => s.trim ().slice ( 1 ) )
      .filter ( s => s.length > 18 )
      .filter ( s => !s.startsWith ( 'File' ) )
    return lines.map ( l => {
      try {
        return JSON.parse ( l ).file;
      } catch ( e ) {
        return 'error: ' + l
      }
    } )
  }
  const foundLines = parse ( found );
  const notFoundLines = parse ( notFound );
  return { foundLines, notFoundLines }
}

export function FilesDetails<S> ( { state }: FilesDetailsProps<S> ) {
  let file = state.optJson ();
  const { foundLines, notFoundLines } = findLines ( file )

  return <>
    <Typography variant="h6">Files</Typography>
    <Paper style={{ padding: 20 }}>{foundLines.map ( ( l, i ) => <Typography key={i}>{l}</Typography> )}</Paper>
    <Typography variant="h6">Not found files</Typography>
    <Paper style={{ padding: 20 }}>{notFoundLines.map ( ( l, i ) => <Typography key={i}>{l}</Typography> )}</Paper>
  </>
}