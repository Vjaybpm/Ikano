import { NameAnd } from "@laoban/utils";
import { ConfigFile } from "@fusionconfig/config";
import { Lens, Lenses, Optional } from "@focuson/lens";


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
  serviceDescription: string
  request: TaskRequestOrResponse
  response: TaskRequestOrResponse
}

export interface Service {

}
export interface FusionConfig extends ConfigFile {
  bpmn: string
  tasks: NameAnd<Task>
}

export type   FusionSelection = {
  selectedParameters?: NameAnd<string | undefined>
  selectedTask?: string
  selectedService?: string
}
export type FusionAllowed = {
  allowedParameters?: NameAnd<string>
  allowedTasks?: NameAnd<string>
  allowedServices?: NameAnd<string>
}


export type EditingData = {
  input?: string
  transformer?: string
  output?: string
}
export type FusionState = {
  selection?: FusionSelection
  currentLoaded?: FusionSelection
  allowed?: FusionAllowed
  editing?: EditingData
  config?: ConfigFile // The config file for a specific set of parameteers
}

export const identityL = Lenses.identity<FusionState> ( "I" )
export const allowedL: Optional<FusionState, FusionAllowed> = identityL.focusQuery ( 'allowed' );
export const selectedL: Optional<FusionState, FusionSelection> = identityL.focusQuery ( 'selection' );
export const currentL: Optional<FusionState, FusionSelection> = identityL.focusQuery ( 'currentLoaded' );

export const currentParamsL: Optional<FusionState, NameAnd<string | undefined>> = currentL.focusQuery ( 'selectedParameters' )
export const allowedParamsL: Optional<FusionState, NameAnd<string>> = allowedL.focusQuery ( 'allowedParameters' )
export const selectedParamsL: Optional<FusionState, NameAnd<string | undefined>> = selectedL.focusQuery ( 'selectedParameters' )
export const allowedTasksL: Optional<FusionState, NameAnd<string>> = allowedL.focusQuery ( 'allowedTasks' )
export const allowedServicesL: Optional<FusionState, NameAnd<string>> = allowedL.focusQuery ( 'allowedServices' )
