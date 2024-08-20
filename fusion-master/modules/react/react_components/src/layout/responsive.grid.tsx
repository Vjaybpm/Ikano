import React from 'react';
import Grid from '@mui/material/Grid';
import { NameAnd } from "@laoban/utils";

export type ResponsiveSelectableGridProps<T> = {
  onClick: ( key: string, t: T ) => void
  items: NameAnd<T>
  children: ( name: string, t: T ) => React.ReactElement
}
export function ResponsiveSelectableGridSize4<T> ( { onClick, items, children }: ResponsiveSelectableGridProps<T> ) {
  const keys = Object.keys ( items ).sort ()
  return (
    <Grid container spacing={2}>
      {keys.map ( key => (
        <Grid item xs={12} sm={6} md={3} key={key} onClick={() => onClick ( key, items[ key ] )}>{children ( key, items[ key ] )}</Grid>
      ) )}
    </Grid>
  );
}
export function ResponsiveSelectableGridSize2<T> ( { onClick, items, children }: ResponsiveSelectableGridProps<T> ) {
  const keys = Object.keys ( items ).sort ()
  return (
    <Grid container spacing={2}>
      {keys.map ( key => (
        <Grid item xs={12} sm={6} md={6} key={key} onClick={() => onClick ( key, items[ key ] )}>{children ( key, items[ key ] )}</Grid>
      ) )}
    </Grid>
  );
}