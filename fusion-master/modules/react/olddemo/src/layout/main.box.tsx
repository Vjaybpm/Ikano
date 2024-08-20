import React, { ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";

export interface MainBoxProps<S> {
  children: ReactNode;
  width: string
}

export function MainBox<S> ( { children, width }: MainBoxProps<S> ) {
  return <>
    <Toolbar/>
    <Toolbar/>
    <Box
      component="main"
      sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 3, width, minWidth: width, maxWidth: width }}>
      {children}
    </Box>
    <div>Main</div>
  </>

}