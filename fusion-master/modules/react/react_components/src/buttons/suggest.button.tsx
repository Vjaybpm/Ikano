import { LensProps } from "@focuson/state";
import React from "react";
import { Button } from "@mui/material";

export interface SuggestButtonRops<S> extends LensProps<S, string, any> {
  input: string | undefined
  output: string | undefined
  children: React.ReactNode
  suggest: string
}

export function SuggestButton ( { state, input, output, children, suggest }: SuggestButtonRops<any> ) {
  async function onClick () {
    console.log ( 'Suggesting', input, output, '-->', suggest )
    try {
      state.setJson ( suggest, '' )
    } catch ( e: any ) {
      state.setJson ( JSON.stringify ( e, null, 2 ), '' )
    }
  }
  return <Button variant='contained' size='small' onClick={onClick}>{children}</Button>;
}