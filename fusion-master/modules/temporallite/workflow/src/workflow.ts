import { ActivityEvent, ActivityEvents, runWithWorkflowHookState, Sideeffect, WorkflowHookState } from "@fusionconfig/activities";
import { IncMetric } from "@fusionconfig/activities";

export type IncMetricFn = ( workflowInstanceId: string ) => IncMetric
export type SideeffectFn = ( workflowInstanceId: string ) => Sideeffect
export type NextInstanceIdFn = ( workflowId: string ) => Promise<string>
export type ExistingStateFn = ( workflowInstanceId: string ) => Promise<ActivityEvents>
export type UpdateEventHistoryFn = ( workflowInstanceId: string ) => ( e: ActivityEvent ) => Promise<void>

export type WorkflowEngine = {
  incMetric: IncMetricFn
  writeMetrics?: SideeffectFn
  nextInstanceId: NextInstanceIdFn
  existingState: ExistingStateFn
  updateEventHistory: UpdateEventHistoryFn
}
export type WorkflowCommon = {
  id: string
}


export type WorkflowResult<T> = {
  result: Promise<T>
  workflowId: string
  instanceId: string
}
export type Workflow0<T> = ( engine: WorkflowEngine ) => Promise<WorkflowResult<T>>
export type Workflow1<P1, T> = ( engine: WorkflowEngine, p1: P1 ) => Promise<WorkflowResult<T>>
export type Workflow2<P1, P2, T> = ( engine: WorkflowEngine, p1: P1, p2: P2 ) => Promise<WorkflowResult<T>>
export type Workflow3<P1, P2, P3, T> = ( engine: WorkflowEngine, p1: P1, p2: P2, p3: P3 ) => Promise<WorkflowResult<T>>
export type Workflow4<P1, P2, P3, P4, T> = ( engine: WorkflowEngine, p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<WorkflowResult<T>>
export type Workflow5<P1, P2, P3, P4, P5, T> = ( engine: WorkflowEngine, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<WorkflowResult<T>>

export type Workflow<T> = Workflow0<T> | Workflow1<any, T> | Workflow2<any, any, T> | Workflow3<any, any, any, T> | Workflow4<any, any, any, any, T> | Workflow5<any, any, any, any, any, T>

export function workflow<T> ( common: WorkflowCommon, fn: () => Promise<T> ): Workflow0<T>
export function workflow<P1, T> ( common: WorkflowCommon, fn: ( p1: P1 ) => Promise<T> ): Workflow1<P1, T>
export function workflow<P1, P2, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2 ) => Promise<T> ): Workflow2<P1, P2, T>
export function workflow<P1, P2, P3, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2, p3: P3 ) => Promise<T> ): Workflow3<P1, P2, P3, T>
export function workflow<P1, P2, P3, P4, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<T> ): Workflow4<P1, P2, P3, P4, T>
export function workflow<P1, P2, P3, P4, P5, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<T> ): Workflow5<P1, P2, P3, P4, P5, T>

export function workflow<T> ( common: WorkflowCommon, fn: ( ...args: any[] ) => Promise<T> ): Workflow<T> {
  const newFn: ( engine: WorkflowEngine, ...args: any[] ) => Promise<WorkflowResult<T>> =
          async ( engine: WorkflowEngine, ...args: any[] ): Promise<WorkflowResult<T>> => {
            const workflowId = common.id;
            const replayState = await engine.existingState ( workflowId );
            const { incMetric, nextInstanceId } = engine
            const workflowInstanceId = await nextInstanceId ( common.id )
            const store: WorkflowHookState = {
              currentReplayIndex: 0, workflowId, workflowInstanceId, incMetric: incMetric ( workflowInstanceId ),
              replayState: replayState, updateEventHistory: engine.updateEventHistory ( workflowInstanceId )
            }
            return {
              workflowId,
              instanceId: workflowInstanceId,
              result: runWithWorkflowHookState ( store, () => fn ( ...args ) ),
            }
          }
  return newFn as Workflow<T>
}



