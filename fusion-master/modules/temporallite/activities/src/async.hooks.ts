import { AsyncLocalStorage } from "async_hooks";
import { ActivityEvent, ActivityEvents } from "./activity.events";
import { IncMetric, inMemoryIncMetric, nullIncMetric, Sideeffect } from "./metrics";
import { NameAnd } from "@laoban/utils";
import { LogLevel, LogLevelValue } from "./log";
import { simpleTemplate } from "@fusionconfig/utils";
import { derefence } from "@laoban/variables";
import { parensVariableDefn } from "@laoban/variables/dist/src/variables";
import { rememberUpdateCache } from "./activities";

export type MetricHookState = {
  incMetric?: IncMetric
  writeMetrics?: Sideeffect
}
export type WorkflowHookState = MetricHookState & {
  workflowId: string
  workflowInstanceId: string
  replayState: ActivityEvents
  currentReplayIndex: number
  updateEventHistory: ( e: ActivityEvent ) => Promise<void>,
}

const workspaceHookState = new AsyncLocalStorage<WorkflowHookState> ()

export function runWithWorkflowHookState<T> ( state: WorkflowHookState, fn: () => T ): T {
  return workspaceHookState.run ( state, fn )
}
export function useWorkflowHookState (): WorkflowHookState {
  let store = workspaceHookState.getStore ();
  if ( store === undefined ) throw new Error ( 'Software error: workflow hook state not set' )
  return store
}

export function workflowHookStateForTest ( store: ActivityEvent[], metrics: NameAnd<number> ): WorkflowHookState {
  const state: WorkflowHookState = {
    incMetric: inMemoryIncMetric ( metrics ),
    workflowId: '1',
    workflowInstanceId: '2',
    replayState: [], //nothing to replay
    currentReplayIndex: 0,
    updateEventHistory: rememberUpdateCache ( store )
  }
  return state;
}

export function useMetricHookState (): IncMetric {
  return workspaceHookState.getStore ().incMetric || nullIncMetric
}

export type LogFn = ( level: LogLevel, key: string ) => void
export const consoleLog: LogFn = ( level, message ) => console.log ( level, message )
export type LoggingHookState = {
  timeService?: () => number
  correlationId?: string
  commonLogMessage?: NameAnd<string>
  mainTemplate?: string  // defaults to {time} {level} [CorrelationId: {correlationId}] {message} or {time} {level} {message} if the correlation id isn't there
  params?: NameAnd<any>
  globalLogLevel?: LogLevel
  log?: LogFn// defaults to console.log if not present
  writeMetrics?: Sideeffect
}
export type SafeLoggingHookState = {
  [K in keyof Omit<LoggingHookState, 'writeMetrics'>]-?: LoggingHookState[K];
} & {
  writeMetrics?: LogFn
}

export const loggingHookState = new AsyncLocalStorage<SafeLoggingHookState> ()

export function cleanLoggingHookState ( l: LoggingHookState ): SafeLoggingHookState {
  return {
    timeService: l.timeService || Date.now,
    correlationId: l.correlationId || '',
    commonLogMessage: l.commonLogMessage || {},
    globalLogLevel: l.globalLogLevel || 'INFO',
    mainTemplate: l.mainTemplate || (l.correlationId && l.correlationId !== '' ? '{time} {level} [CorrelationId: {correlationId}] {message}' : '{time} {level} {message}'),
    params: l.params || {},
    log: l.log || consoleLog
  }
}

export function useLogging ( messages?: NameAnd<string>, dictionary?: NameAnd<any> ): LogFn {
  const safeDictionary = dictionary || {}
  const state = loggingHookState.getStore ()
  if ( state === undefined ) throw new Error ( 'Software error: logging hook state not set' )
  const global = LogLevelValue[ state.globalLogLevel ]
  return ( level, rawMessage ) => {
    if ( LogLevelValue[ level ] < global ) return
    const { log, correlationId, params, mainTemplate, timeService, commonLogMessage, globalLogLevel } = state;
    const allMessages = { ...commonLogMessage, ...(messages || {}) }
    let messageTemplate = allMessages[ rawMessage ] ? allMessages[ rawMessage ] : rawMessage;
    const time = timeService ()
    const fullDictionary = { ...params, ...safeDictionary, correlationId, time, message: rawMessage, level, }
    const message = derefence ( 'useLogging', fullDictionary, messageTemplate, { variableDefn: parensVariableDefn, allowUndefined: true } )
    const fullMessage = simpleTemplate ( mainTemplate, { correlationId, time, message, level } )
    log ( level, fullMessage )
  }
}
