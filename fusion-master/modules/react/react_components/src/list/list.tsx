import { LensProps, LensProps2 } from "@focuson/state";
import React from "react";
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { safeArray } from "@laoban/utils";

export interface ClickableListProps<S> extends LensProps<S, string, any> {
  items: string[];
}

export function ClickableList<S> ( { state, items }: ClickableListProps<S> ) {
  return (
    <List sx={{ width: 'auto', bgcolor: 'background.paper' }}>
      {items.map ( ( item, index ) => (
        <ListItem
          key={index}
          disablePadding
          sx={{
            width: 'fit-content',
            bgcolor: 'background.paper',
            padding: 0,
            border: '1px solid #ccc',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          <ListItemButton onClick={() => state.setJson ( item, '' )} sx={{ justifyContent: 'flex-start' }}>
            <ListItemText primary={item}/>
          </ListItemButton>
        </ListItem>
      ) )}
    </List>
  );
}

export type ClickableListFromStateProps<S> = LensProps2<S, string[], string, any>;
export function ClickableListFromState<S> ( { state }: ClickableListFromStateProps<S> ) {
  const options = state.optJson1 () || [];
  return <ClickableList state={state.state2 ()} items={options}/>

}

