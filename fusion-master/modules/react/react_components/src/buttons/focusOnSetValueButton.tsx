import { LensProps } from "@focuson/state";
import React from "react";
import { Button, ButtonProps } from "@mui/material";

export interface FocusOnSetValueButtonProps<S, T> extends LensProps<S, T, any>, ButtonProps {
  title?: string
  valueToSet: T
  addDepressedSx?: false
}
export function FocusOnSetValueButton<S, T> ( { addDepressedSx, state, title, valueToSet, children, sx, ...rest }: FocusOnSetValueButtonProps<S, T> ) {
  const selected = state.optJson () === valueToSet
  const actualSx = addDepressedSx === undefined ? {
    backgroundColor: selected ? '#1976d2' : '#e0e0e0', // Light grey when not selected
    '&:hover': {
      backgroundColor: selected ? '#115293' : '#bdbdbd', // Darker grey on hover when not selected
    },
    color: selected ? '#ffffff' : '#212121', // Dark grey text when not selected
    ...sx
  } : sx;

  return <Button variant="contained"{...rest}
                 sx={actualSx}
                 onClick={() => {
                   console.log ( 'FocusOnSetValueButton onClick state', state );
                   state.setJson ( valueToSet, '' );
                 }}>{children || title  || 'Toggle'}</Button>

}
