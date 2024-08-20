import Slide from '@mui/material/Slide';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';
import { useSizing } from './sizing.context';

interface SliderBarProps {
  children: React.ReactNode;
  open: boolean;
  width: string
  anchor: 'left' | 'right'; // Add an anchor prop to determine the side
}

export function RightSlider ( { children, open, anchor, width }: SliderBarProps ) {
  // Determine the direction of the slide based on the anchor
  const slideDirection = anchor === 'left' ? 'right' : 'left';

  return (
    <Drawer
      variant="persistent"
      anchor={anchor}
      open={open}
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width, boxSizing: 'border-box' },
      }}
    >
      <Toolbar/>
      {children}
    </Drawer>
  );
}
