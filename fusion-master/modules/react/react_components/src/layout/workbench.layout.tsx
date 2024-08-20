import React, { ReactNode } from "react";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import { WorkbenchMainBar } from "./workbench.main.bar";
import { SizingData, useSizing } from "./drawers/sizing.context";
import { LeftDrawer } from "./drawers/left.drawer";
import { RightSlider } from "./drawers/slider.drawer";


export function calcDrawer ( leftDrawerOpen: boolean, rightDrawerOpen: boolean, layout: SizingData | undefined ) {
  const targetLeftDrawerWidth = layout?.leftDrawerWidth || '240';
  const leftDrawerWidth = leftDrawerOpen ? targetLeftDrawerWidth : '100px';
  const targetRightDrawerWidth = layout?.rightDrawerWidth || '400px';
  const rightDrawerWidth = rightDrawerOpen ? targetRightDrawerWidth : '100px';
  const width = `calc(100vw - ${leftDrawerWidth} - ${rightDrawerWidth} - 100px)`
  return { leftDrawerWidth, rightDrawerWidth, width };
}


export interface WorkbenchLayoutProps {
  title: string
  Nav: ReactNode;
  Details: ReactNode;
  children: ReactNode;
  clickHome: () => void
}

export function WorkbenchLayout ( { title, children, Nav, Details , clickHome}: WorkbenchLayoutProps ) {
  const [ leftDrawerOpen, setLeftDrawerOpen ] = React.useState ( false );
  const [ rightDrawerOpen, setRightDrawerOpen ] = React.useState ( false );
  const sizing = useSizing ()
  const { width, leftDrawerWidth, rightDrawerWidth } = calcDrawer ( leftDrawerOpen, rightDrawerOpen, sizing );
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline/>
        <WorkbenchMainBar clickHome={clickHome} title={title} leftDrawerClick={() => setLeftDrawerOpen ( !leftDrawerOpen )} rightDrawerClick={() => setRightDrawerOpen ( !rightDrawerOpen )}/>
        <LeftDrawer width={leftDrawerWidth} Nav={Nav} open={leftDrawerOpen}/>
        <Box sx={{ width}}><Toolbar/>{children}</Box>
        <RightSlider width={rightDrawerWidth} anchor='right' open={rightDrawerOpen} children={Details}/>
      </Box>

    </>
  );
}

