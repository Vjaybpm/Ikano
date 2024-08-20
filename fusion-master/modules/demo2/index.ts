export type Sink = {
  fn: ( data: any ) => Promise<any>;
}

export type Source = {
  fn: () => Promise<any>;
}

export type GuiTask = {
  fn: ( data: any ) => Promise<any>;
}
export type ServiceTask = {
  fn: ( data: any ) => Promise<any>
};


export async function workflow ( start: Source, getData: GuiTask, aml: ServiceTask, sink: Sink ) {
  let startData = await start.fn ();
  let gotData = getData.fn ( startData );
  let amlData = aml.fn ( await gotData );
  sink.fn ( amlData )
}