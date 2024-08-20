import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info";
import React from "react";

export interface WorkbenchMainBarProps {
  title: string
  clickHome: () => void
  leftDrawerClick: () => void
  rightDrawerClick: () => void
}
export function WorkbenchMainBar<S> ( { title, clickHome,leftDrawerClick, rightDrawerClick }: WorkbenchMainBarProps ) {

  return <AppBar position="fixed" sx={{ zIndex: ( theme ) => theme.zIndex.drawer + 1 }}>
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open nav drawer"
        edge="start"
        onClick={leftDrawerClick}
        sx={{ mr: 2 }}
      >
        <MenuIcon/>
      </IconButton>
      <Typography onClick={clickHome} variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
      <IconButton
        color="inherit"
        aria-label="open info drawer"
        onClick={rightDrawerClick} // Adjust this onClick event
      >
        <InfoIcon/>
      </IconButton>
    </Toolbar>
  </AppBar>
}
