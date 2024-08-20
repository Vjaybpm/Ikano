import { Lenses, Optional } from "@focuson/lens";
import { ErrorsAnd, NameAnd, } from "@laoban/utils";
import { FCLogRecord } from "@itsmworkbench/utils";
import { UrlFolder } from "@itsmworkbench/urlstore"

import { ConfigFile } from "@fusionconfig/config";
import { ReqRespAction } from "./test.selection";
import { ReqRespTestsResult, RunReqRespTestsDefn } from "@fusionconfig/tests";


export type SelectionState = {
  route?: string
  routeTemplateName?: string
  task?: string
  requestResponse?: ReqRespAction
  testName?: string
}
export type DebugState = {
  devMode?: boolean
  debugTab?: string
  depData?: boolean
}
export type ConfigData = {
  legalTasks: string[]
}

export interface NameAndId {
  name: string
  id: string
}

export interface TaskRequestOrResponse {
  topic: string
  kafka: NameAndId
  schema: NameAndId
  transformer: NameAndId
}
export interface Task {
  service: string
  variables: string | string[]
  taskDescription: string
  serviceDescription: string
  request: TaskRequestOrResponse
  response: TaskRequestOrResponse
}
export function taskToRunDefn ( task: Task ): RunReqRespTestsDefn {
  const request = {
    schema: { input: task.request.schema.name, output: task.request.kafka.name },
    transformer: task.request.transformer.name
  };
  const response = {
    schema: { input: task.response.kafka.name, output: task.response.schema.name },
    transformer: task.response.transformer.name
  };
  return { request, response }
}


export interface FusionConfigFile extends ConfigFile {
  bpmn: string
  tasks: NameAnd<Task>
}

export type FusionWorkbenchState = {
  selectionState: SelectionState
  debug?: DebugState
  depDataLog: FCLogRecord<any, any>[],
  folders?: UrlFolder
  legal_parameters?: NameAnd<string[]>
  parameters?: NameAnd<string>
  rawConfig?: string
  config?: FusionConfigFile
  configLegalData?: ConfigData
  tests?: ErrorsAnd<ReqRespTestsResult>
}

export const idL = Lenses.identity<FusionWorkbenchState> ()
export const selectionL = idL.focusQuery ( 'selectionState' );
export const taskL = selectionL.focusQuery ( 'task' )
export const routeTemplateNameL = selectionL.focusQuery ( 'routeTemplateName' )
export const testNameL = selectionL.focusQuery ( 'testName' )
export const testL: Optional<FusionWorkbenchState, ErrorsAnd<ReqRespTestsResult>> = idL.focusQuery ( 'tests' )
export const requestResponseL = selectionL.focusQuery ( 'requestResponse' )
export const routeL: Optional<FusionWorkbenchState, string> = selectionL.focusQuery ( 'route' )
export const foldersO = idL.focusQuery ( 'folders' )
export const legalParamsL: Optional<FusionWorkbenchState, NameAnd<string[]>> = idL.focusQuery ( 'legal_parameters' )
export const paramsL: Optional<FusionWorkbenchState, NameAnd<string>> = idL.focusQuery ( 'parameters' )
export const rawConfigL: Optional<FusionWorkbenchState, string> = idL.focusQuery ( 'rawConfig' )
export const configL: Optional<FusionWorkbenchState, FusionConfigFile> = idL.focusQuery ( 'config' )

export const tasksL = configL.focusQuery ( 'tasks' )
export const configLegalDataL = idL.focusQuery ( 'configLegalData' )
export const configLegalTasksL = configLegalDataL.focusQuery ( 'legalTasks' )
