import { LensProps } from "@focuson/state";
import React from "react";
import { Button } from "@mui/material";
import { jsonataTransformer } from "@fusionconfig/jsonata";

export interface TransformButtonProps<S> extends LensProps<S, string, any> {
  input: string | undefined
  tx: string | undefined
  children: React.ReactNode
}

export function TransformButton ( { state, input, tx, children }: TransformButtonProps<any> ) {
  async function onClick () {
    console.log ( 'Transforming', input, tx )
    try {
      const json = JSON.parse ( input || '{}' )
      const op = await jsonataTransformer ( tx || '' ) ( json  )
      state.setJson ( JSON.stringify ( op, null, 2 ), '' )
    } catch ( e: any ) {
      state.setJson ( JSON.stringify ( e, null, 2 ), tx || '' )
    }
  }
  return <Button variant='contained' size='small' onClick={onClick}>{children}</Button>;
}