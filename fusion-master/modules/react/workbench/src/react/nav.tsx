import { LensProps, LensState2 } from "@focuson/state";
import EventIcon from '@mui/icons-material/Event';

import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import React from "react";
import { Box } from "@mui/material";
import { configLegalTasksL, FusionWorkbenchState, requestResponseL, routeL, routeTemplateNameL, taskL } from "../state/fusion.state";
import { FocusOnSetValueButton, FocusOnToggleButton, Loading, MultipleSelects, SelectWhenIdIsName, SingleSelect, SingleSelectWithOptions } from "@fusionconfig/react_components";
import { NameAnd } from "@laoban/utils";
import { HideNavButton } from "@fusionconfig/react_components/src/buttons/hide.nav.button";
import { reqRespOptions } from "../state/test.selection";


export function FusionNav<S> ( { state }: LensProps<S, FusionWorkbenchState, any> ) {
  const buttonSx = {
    justifyContent: 'flex-start',
    textAlign: 'left',
    width: '100%',
  };


  const devMode = state.optJson ()?.debug?.devMode;

  let paramsState: LensState2<S, NameAnd<string[]>, NameAnd<string>, any> = state.doubleUp ().focus1On ( 'legal_parameters' ).focus2On ( 'parameters' )
  return <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2, // Adjust the gap size to your preference
      p: 1, // Adds padding around the entire container
    }}
  >

    <HideNavButton title='Parameters'><Loading state={paramsState.state2 ()}>{_ =>
      <MultipleSelects state={paramsState}/>}</Loading></HideNavButton>
    <HideNavButton title='Tasks'><Loading state={paramsState.state2 ()}>{_ =>
      <>
        <SelectWhenIdIsName name='tasks'
                            onClick={( task ) => state.doubleUp ().chain1 ( taskL ).chain2 ( routeTemplateNameL ).setJson ( task, 'task', 'nav' )}
                            selected={state.chainLens ( taskL ).optJson ()}
                            options={state.chainLens ( configLegalTasksL ).optJsonOr ( [] )}/>
        <SelectWhenIdIsName name='requestOrResponse'
                            selected={state.chainLens ( requestResponseL ).optJson ()}
                            onClick={( reqRes ) => state.chainLens ( requestResponseL ).setJson ( reqRes as any, 'nav' )}
                            options={reqRespOptions}/>
      </>
    }</Loading></HideNavButton>
    <FocusOnToggleButton aria-label='Toggle Developer Mode' startIcon={<DeveloperModeIcon/>} state={state.focusOn ( 'debug' ).focusOn ( 'devMode' )} sx={buttonSx}>Developer Mode</FocusOnToggleButton>
    {devMode && <>
        <FocusOnSetValueButton aria-label='Debug Folders'
                               startIcon={<EventIcon/>}
                               valueToSet='/folders' state={state.chainLens ( routeL )}
                               sx={buttonSx}>Debug Folders</FocusOnSetValueButton>
        <FocusOnSetValueButton aria-label='Booking1'
                               startIcon={<EventIcon/>}
                               valueToSet='/booking' state={state.chainLens ( routeL )}
                               sx={buttonSx}>Booking1</FocusOnSetValueButton>
        <FocusOnSetValueButton aria-label='Booking2'
                               startIcon={<EventIcon/>}
                               valueToSet='/booking2' state={state.chainLens ( routeL )}
                               sx={buttonSx}>Booking2</FocusOnSetValueButton>
        <FocusOnSetValueButton aria-label='Booking3'
                               startIcon={<EventIcon/>}
                               valueToSet='/booking3' state={state.chainLens ( routeL )}
                               sx={buttonSx}>Booking3</FocusOnSetValueButton>

    </>}
  </Box>
}
// {/*<FocusOnSetValueButton aria-label='Debug Variables'*/}
// {/*                       valueToSet={{ workspaceTab: 'debugVariables' }}*/}
// {/*                       state={state.focusOn ( 'debug' ).focusOn ( 'debugTab' )} sx={buttonSx}>Debug Variables</FocusOnSetValueButton>*/}
// {/*<FocusOnSetValueButton aria-label='Debug Enriched Events' startIcon={<EventIcon/>} valueToSet={{ workspaceTab: 'debugEnrichedEvents' }} state={tabsState} sx={buttonSx}>Debug Enriched Events</FocusOnSetValueButton>*/}
// {/*<FocusOnSetValueButton aria-label='Chat' startIcon={<ChatIcon/>} valueToSet={{ workspaceTab: 'chat' }} state={tabsState} sx={buttonSx}>Chat</FocusOnSetValueButton>*/}
