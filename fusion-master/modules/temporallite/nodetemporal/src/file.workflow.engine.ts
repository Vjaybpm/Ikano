import { FileNamesForTemporal } from "./filenames";
import { swapFiles } from "./metrics.file";
import { WorkflowEngine } from "@fusionconfig/workflow";
import { inMemoryIncMetric } from "@fusionconfig/activities";
import { NameAnd } from "@laoban/utils";
import { fileExistingState, fileUpdateEventHistory } from "./file.event.history";


export function fileWorkflowEngine ( names: FileNamesForTemporal, instanceId?: string ): WorkflowEngine {
  const metrics: NameAnd<number> = {}
  return {
    existingState: fileExistingState ( names ),
    incMetric: () => inMemoryIncMetric ( metrics ),
    nextInstanceId: instanceId ? async () => instanceId : names.nextInstanceId,
    writeMetrics: ( workflowInstanceId: string ) => async () => {swapFiles ( names.metrics ( workflowInstanceId ), JSON.stringify ( metrics ) )},
    updateEventHistory: fileUpdateEventHistory ( names )
  }
}