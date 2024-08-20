import React from 'react';
import { addEventStoreListener, EventStore, eventStore, setEventStoreValue } from "@itsmworkbench/eventstore";
import { LensProps, LensState, lensState } from '@focuson/state';
import { createRoot } from 'react-dom/client';
import { DevMode, SizingContext, WorkbenchLayout } from "@fusionconfig/react_components";
import { configL, configLegalTasksL, foldersO, FusionConfigFile, FusionWorkbenchState, legalParamsL, paramsL, rawConfigL, requestResponseL, routeL, routeTemplateNameL, selectionL, taskL, taskToRunDefn, testL, testNameL } from "./state/fusion.state";
import { makeSearchString, placeRouteInto, Route, RouteDebug, RouteProvider, RouteVars, RoutingData } from "@fusionconfig/react_routing";
import { FusionNav } from "./react/nav";
import { ErrorsAnd, hasErrors, mapObject, NameAnd, toArray } from "@laoban/utils";
import { FCLogRecord, futureCacheConsoleLog, futureCacheLog } from "@itsmworkbench/utils";
import { UrlStoreApiClientConfig, urlStoreFromApi } from "@itsmworkbench/browserurlstore";
import { NameSpaceDetails, UrlFolder, UrlQuery } from "@itsmworkbench/urlstore";
import { YamlCapability } from "@itsmworkbench/yaml";
import { jsYaml } from "@itsmworkbench/jsyaml";
import { allDomainDetails } from "@fusionconfig/alldomains";
import { DebugFolders } from "./playground/debug.folders";
import { objectToQueryString } from "@fusionconfig/utils";
import { FusionDetails } from "./react/details";
import { TaskDetailsPage } from "./react/task.details.page";
import { reqRespOptions } from "./state/test.selection";
import { ReqRespTestsResult } from "@fusionconfig/tests";
import { browserTestsRun } from "@fusionconfig/browsertests";
import { HomePage } from "./react/home.page";
import { Optional } from "@focuson/lens";
import { DD, depData, depDataK, dependentDataEngine, setJsonForDepData } from "@itsmworkbench/dependentdata";
import RoomBooking from "../roombooking/room.booking";
import { BookingGrid2 } from "../roombooking/room.booking2";


const rootElement = document.getElementById ( 'root' );
if ( !rootElement ) throw new Error ( 'Failed to find the root element' );
const root = createRoot ( rootElement );
const yaml: YamlCapability = jsYaml ()
let rootUrl = "http://localhost:1235/";
const container: EventStore<FusionWorkbenchState> = eventStore<FusionWorkbenchState> ()
const nameSpaceDetails: NameAnd<NameSpaceDetails> = allDomainDetails ( yaml )

const urlStoreconfig: UrlStoreApiClientConfig = { apiUrlPrefix: rootUrl + "url", details: nameSpaceDetails }
const urlStore = urlStoreFromApi ( urlStoreconfig )


const routingData: RoutingData<FusionWorkbenchState> = {
  selectionO: routeTemplateNameL,
  templates: {
    folders: '/folders',
    task: '/task/{task}/{requestResponse}',
    home: '/',
  },
  optionals: {
    task: taskL,
    requestResponse: requestResponseL as Optional<FusionWorkbenchState, string>,
  },
  parametersO: paramsL
}

const logForDeps: FCLogRecord<any, any>[] = []
// const tagStore = optionalTagStore ( tagsL );
const depEngine = {
  ...dependentDataEngine<FusionWorkbenchState> ( () => container.state, setEventStoreValue ( container ) ),
  listeners: [ futureCacheLog ( logForDeps ), futureCacheConsoleLog ( 'fc -' ) ]
}

const dirList = depDataK ( 'dirlist', foldersO,
  async (): Promise<UrlFolder> => {
    const folders = await urlStore.folders ( "org", "schema" )
    if ( hasErrors ( folders ) ) throw new Error ( 'Failed to load ticketList\n' + folders.join ( '\n' ) )
    return folders
  }, {} )

const legalParamsD = depDataK ( 'legalParams', legalParamsL,
  async (): Promise<NameAnd<string[]>> => {
    const response = await fetch ( `${rootUrl}/axes/global.yaml` );
    if ( response.status >= 400 ) throw new Error ( `Failed to load parameters\n${response.statusText}` )
    const json: any = await response.json ()
    return json
  }, {} )

const paramsD = depData<FusionWorkbenchState, NameAnd<string[]>, NameAnd<string>> ( 'params', paramsL,
  ( original, lp ) => {
    if ( original !== undefined ) return original
    if ( lp === undefined ) return undefined as any
    return mapObject ( lp, ( v, name ) => v[ 0 ] );
  }, legalParamsD, {} )

const rawConfig = depDataK ( 'rawConfig', rawConfigL,
  async ( _, ps: NameAnd<string> ): Promise<string> => {
    const params = objectToQueryString ( ps )
    const paramString = params ? `?${params}` : ''
    const response = await fetch ( `${rootUrl}/fusion/global.yaml${paramString}`, {} );
    if ( response.status >= 400 ) throw new Error ( `Failed to load parameters\n${response.statusText}` )
    return await response.text ()
  }, paramsD, {} )

const configD = depData ( 'config', configL,
  ( _, raw: string ): FusionConfigFile => yaml.parser ( raw ), rawConfig, {} )


const legalTasks = depData ( 'configLegalData', configLegalTasksL,
  ( orig, rawConfig, config: any ) => config?.tasks === undefined ? undefined as any as string[] : Object.keys ( config?.tasks ),
  rawConfig, configD, {} )

const taskD = depData ( 'task', taskL, ( old ) => old, {} )
const requestResponseD = depData ( 'requestResponse', requestResponseL, old => old, {} )

async function loadOne ( query: UrlQuery ) {
  const res = urlStore.list ( query )
  if ( hasErrors ( res ) ) throw new Error ( res.join ( '\n' ) )
  return res
}
const testsD = depDataK<FusionWorkbenchState, FusionConfigFile, string, ErrorsAnd<ReqRespTestsResult>> ( 'tests',
  testL,
  async ( x, config, task ): Promise<ErrorsAnd<ReqRespTestsResult>> => {
    const theTask = config.tasks[ task ]
    if ( theTask === undefined ) throw new Error ( `Task ${task} not found in config` )
    const runDefn = taskToRunDefn ( theTask )
    const res: ErrorsAnd<ReqRespTestsResult> = await browserTestsRun ( rootUrl ) ( runDefn )
    return res
  }, configD, taskD, {} )


const route = depData ( 'route', routeL,
  ( _, task: string, params: NameAnd<string>, reqRes ) => {
    // const route = calculateRoute ( routingData, container.state )
    // console.log ( 'calculated route', route )
    // return route || '/'
    const rawSearchString = makeSearchString ( params )
    const search = params === undefined ? window.location.search : `?${rawSearchString}`
    const repResString = reqRes === undefined ? 'Summary' : `${reqRes}`
    const taskString = task ? `/task/${task}/${repResString}` : '/'
    return taskString + search
  }, taskD, paramsD, requestResponseD, {} )


const deps: DD<FusionWorkbenchState, any> [] = [ dirList, legalParamsD, paramsD, rawConfig, configD, legalTasks, taskD, requestResponseD, testsD, route ]

const setJson = setJsonForDepData ( depEngine ) ( deps, {
  updateLogs: s => {
    s.depDataLog = [ ...toArray ( s.depDataLog ), ...logForDeps ]
    logForDeps.length = 0
    return s
  },
  debug: () => container.state?.debug?.depData,
  delay: 500,
} )
// const setJson = setEventStoreValue ( container );
addEventStoreListener ( container, (( _, s ) => {
  const state = lensState ( s, setJson, 'state', {} )
  return root.render ( <App state={state}/> );
}) )

function homeClick<S, T> ( state: LensState<S, T, any>, t: T ) {
  return () => state.setJson ( t, '' )
}
function App ( { state }: LensProps<FusionWorkbenchState, FusionWorkbenchState, any> ) {
  const devMode = state.optJson ()?.debug?.devMode;
  const tasks = state.optJson ()?.config?.tasks
  const testResult = state.optJson ()?.tests
  const tasksState = state.doubleUp ().withLens1 ( requestResponseL ).withLens2 ( testNameL )
  return (
    <RouteProvider state={state.copyWithLens ( routeL )}>
      <SizingContext.Provider value={{ leftDrawerWidth: '240px', rightDrawerWidth: '600px' }}>
        <WorkbenchLayout
          clickHome={homeClick ( state.chainLens ( selectionL ), { routeTemplateName: 'home', requestResponse: 'Summary' } )}
          title='Fusion Workbench'
          Nav={<FusionNav state={state}/>}
          Details={<FusionDetails state={state}/>}>
          <Route path='/'><HomePage state={state}/></Route>
          <Route path='/booking'><RoomBooking/></Route>
          <Route path='/booking2'><BookingGrid2/></Route>
          {/*<Route path='/booking3'><BookingGrid3/></Route>*/}
          <Route path='/folders'><DebugFolders state={state.focusOn ( 'folders' )}/></Route>
          <RouteVars path='/task/{task}/{action}'>{
            ( { task } ) => <>
              <TaskDetailsPage task={task} tasks={tasks} testResult={testResult} state={tasksState}/>
            </>
          }</RouteVars>
          {devMode && <DevMode state={state.focusOn ( 'debug' ).focusOn ( 'debugTab' )}
                               extra={{ route: <RouteDebug/> }}
                               titles={[ 'selectionState', 'folders', 'rawConfig', 'legal_parameters',
                                 'parameters', 'config', 'legalTasks', 'tests', 'configLegalData', 'tags', 'depDataLog', 'debug' ]}/>}
        </WorkbenchLayout>
      </SizingContext.Provider>
    </RouteProvider>)
}

const startState: FusionWorkbenchState = {
  selectionState: { requestResponse: reqRespOptions[ 0 ] },
  depDataLog: [],
  debug: { depData: true },
}
const withRoute = placeRouteInto ( routingData, window.location.pathname + window.location.search, startState )
console.log ( 'withRoute', withRoute )
// let parameters: NameAnd<string> | undefined = getQueryParams ( window.location.search )
// if ( Object.keys ( parameters ).length === 0 ) parameters = undefined
setJson ( startState )
