import { inMemoryIncMetric, MetricHookState } from "@fusionconfig/activities";
import { NameAnd } from "@laoban/utils";
import fs from "fs";
import { FileNamesForTemporal } from "./filenames";

export async function swapFiles ( file: string, newData: string ): Promise<void> {
  const tempFilePath = `${file}.tmp`;

  await fs.promises.writeFile ( tempFilePath, newData );
  await fs.promises.rename ( tempFilePath, file );
}


export const metricsOnFile = ( names: FileNamesForTemporal ) => ( workspaceInstanceId: string ): MetricHookState => {
  const file = names.metrics ( workspaceInstanceId );
  const metrics: NameAnd<number> = {}
  return {
    incMetric: inMemoryIncMetric ( metrics ),
    writeMetrics: async () => swapFiles ( file, JSON.stringify ( metrics ) )
  }

};
