import React, { ReactElement } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { toArray } from "@laoban/utils";
import { LensProps, LensProps2, LensState, LensState2 } from "@focuson/state";

export interface TabPanelDetails {
  title: string
}
export interface SimpleTabPanelProps extends TabPanelDetails {
  children: ReactElement;
}
export interface TabPanelProps<S, M, K extends keyof M, C> extends LensProps2<S, M, number, C>, TabPanelDetails {
  children: ( state: LensState<S, M[K], C> ) => ReactElement;
  focuson: K
}

export function TabPanel<S, M, K extends keyof M, C> ( { state, focuson, children }: TabPanelProps<S, M, K, C> ) {
  const childState = state.state1 ().focusOn ( focuson )
  return <Box sx={{}}>
    {children ( childState )}
  </Box>
}

export function SimpleTabPanel<S, M, C> ( { title, children }: SimpleTabPanelProps ) {
  return <Box sx={{}}>
    {children}
  </Box>
}
export interface TabsContainerProps<S, M, C> extends LensProps2<S, M, string, C> {
  label: string
  height?: string
  children: React.ReactElement<TabPanelDetails>[] | React.ReactElement<TabPanelDetails>;
}

export function TabsContainer<S, M, C> ( props: TabsContainerProps<S, M, C> ) {
  const { state, children, label } = props;
  const childrenArray = toArray ( children )
  let activeTabName = state.optJson2 ();
  const rawActiveTab = childrenArray.findIndex ( c => c.props.title === activeTabName )
  const activeTab = rawActiveTab > 0 ? rawActiveTab : 0;

  function handleChange ( event: React.SyntheticEvent, newValue: number ) {
    const child = childrenArray[ newValue ];
    const tabName = child?.props.title;
    if ( tabName )
      state.state2 ().setJson ( tabName, 'tab changed' );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: props.height, overflowX: 'auto' }}>
      <Box sx={{ minWidth: 'max-content' }}> {/* Encapsulate Tabs in a Box that can grow in width */}
        <Tabs value={activeTab} onChange={handleChange} aria-label={label} variant="scrollable" scrollButtons="auto">
          {childrenArray.map((child, index) => (
            <Tab label={child.props.title} key={child.props.title} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ height: '100%' }}>
        {/* Ensure the selected TabPanel is rendered here and is the only part scrollable */}
        {React.cloneElement ( childrenArray[ activeTab ], { key: activeTab } )}
      </Box>
    </Box>
  );
}