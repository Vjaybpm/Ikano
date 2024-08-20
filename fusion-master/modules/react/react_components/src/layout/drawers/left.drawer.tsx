import React, { ReactNode } from "react";
import { Drawer, Toolbar } from "@mui/material";

export interface LeftDrawerProps {
  Nav: ReactNode;
  open: boolean;
  width: string;
}
export function LeftDrawer ( { open, Nav, width }: LeftDrawerProps ) {
  return (
    <Drawer
      variant="persistent"
      anchor='left'
      open={open}
      sx={{ width, flexShrink: 0, '& .MuiDrawer-paper': { width, boxSizing: 'border-box' }, }}
    >
      <Toolbar/>
      {Nav}
    </Drawer>
  );
}
