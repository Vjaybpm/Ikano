import React from "react";
import { LensProps, LensState2 } from "@focuson/state";
import { NameAnd, safeObject, toArray } from "@laoban/utils";
import { DisplayJson } from "./display.json";
import { SimpleTabPanel, TabsContainer } from "../layout/TabPanel";

//Focused on selected tab
export interface DevModeProps<S> extends LensProps<S, string, any> {
  maxHeight?: string
  maxWidth?: string
  titles: string[]
  extra?: NameAnd<React.ReactElement>
}
function DisplayOne ( { json, maxWidth, maxHeight }: { json: any, maxWidth?: string, maxHeight?: string } ) {
  if ( typeof json === 'string' ) return <pre>{json}</pre>
  return <DisplayJson maxWidth={maxWidth} maxHeight={maxHeight} json={json}/>

}
function makeDevPanels ( titles: string[], keyPrefix: string, maxWidth: string | undefined, maxHeight: string | undefined, main: any ) {
  if ( main === undefined ) return []
  return toArray ( titles ).map ( t => <SimpleTabPanel key={keyPrefix + t} title={t}><DisplayOne maxWidth={maxWidth} maxHeight={maxHeight} json={main?.[ t ]}/></SimpleTabPanel> );
}
export function DevMode<S> ( { state, titles, maxHeight, maxWidth, extra }: DevModeProps<S> ) {
  const main: any = state.main;
  const full = <SimpleTabPanel key='full' title='Full'><DisplayJson maxWidth={maxWidth} maxHeight={maxHeight} json={main}/></SimpleTabPanel>
  const titlePanels = makeDevPanels ( titles, 'titles.', maxWidth, maxHeight, main )
  // const forTicketPanels = makeDevPanels ( forTicket, 'forTicket.', maxWidth, maxHeight, main?.forTicket )
  // const tempDataPanels = makeDevPanels ( tempData, 'temp.', maxWidth, maxHeight, main?.forTicket?.tempData )
  const extraPanels = Object.entries ( safeObject ( extra ) ).map ( ( [ name, panel ], i ) =>
    <SimpleTabPanel key={name} title={name}>{panel}</SimpleTabPanel> )
  const panels = [ full, ...extraPanels, ...titlePanels ]//, ...forTicketPanels, ...tempDataPanels ]
  console.log ( 'panels', panels.length, panels.map ( p => p.props.title ) )
  const tabState: LensState2<S, string, string, any> = state.doubleUp ();
  return <TabsContainer label='Dev mode data' state={tabState} children={panels}/>
}
