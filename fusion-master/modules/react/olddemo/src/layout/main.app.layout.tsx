import React, { ReactNode } from "react";
import { Box, CssBaseline } from "@mui/material";
import { MainAppBar, MainAppBarProps } from "./main.app.bar";
import { MainBox } from "./main.box";
import { LeftDrawer } from "./left.drawer";
import { RightSlider } from "./slider.drawer";
import { SizingData, useSizing } from "./sizing.context";


export function calcDrawer ( leftDrawerOpen: boolean, rightDrawerOpen: boolean, layout: SizingData | undefined ) {
  const targetLeftDrawerWidth = layout?.leftDrawerWidth || '240';
  const leftDrawerWidth = leftDrawerOpen ? targetLeftDrawerWidth : '100px';
  const targetRightDrawerWidth = layout?.rightDrawerWidth || '400px';
  const rightDrawerWidth = rightDrawerOpen ? targetRightDrawerWidth : '100px';
  const width = `calc(100vw - ${leftDrawerWidth} - ${rightDrawerWidth} - 100px)`
  return { leftDrawerWidth, rightDrawerWidth, width };
}


export interface MainAppProps {
  title: string
  Nav: ReactNode;
  Details: ReactNode;
  children: ReactNode;
}

export function MainAppLayout ( { title, children, Nav, Details }: MainAppProps ) {
  const [ leftDrawerOpen, setLeftDrawerOpen ] = React.useState ( false );
  const [ rightDrawerOpen, setRightDrawerOpen ] = React.useState ( false );
  const sizing = useSizing ()
  const { width, leftDrawerWidth, rightDrawerWidth } = calcDrawer ( leftDrawerOpen, rightDrawerOpen, sizing );
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline/>
      <MainAppBar title={title} leftDrawerClick={() => setLeftDrawerOpen ( !leftDrawerOpen )} rightDrawerClick={() => setRightDrawerOpen ( !rightDrawerOpen )}/>
      <LeftDrawer width={leftDrawerWidth} Nav={Nav} open={leftDrawerOpen}/>
      <Box sx={{ width: '100%' }}>{children}</Box>
      <RightSlider width={rightDrawerWidth} anchor='right' open={rightDrawerOpen} children={Details}/>
    </Box>
  );
}

