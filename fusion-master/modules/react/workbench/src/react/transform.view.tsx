import { isCannotRunTestResult, isRanTestResult, OneTestResult, RanTestResult, RanTestSchemaName, SchemaTestError, SchemaTestResult, TestsResult, TransformerTestResult } from "@fusionconfig/tests";
import { Grid } from "@mui/material";
import React, { useState } from "react";
import { CardWithTitleAndBody, DataTable } from "@fusionconfig/react_components";
import { flatMap, lastSegment } from "@laoban/utils";

export type TransformViewLayoutProps = {
  samples: React.ReactElement
  input: React.ReactElement
  transformer: React.ReactElement
  actualOutput: React.ReactElement
  expectedOutput: React.ReactElement
  errors: React.ReactElement
}
export function TransformViewLayout ( { samples, input, transformer,expectedOutput, actualOutput, errors }: TransformViewLayoutProps ) {
  return <Grid container spacing={2}>
    <Grid item xs={12} sm={12} md={4}>
      <CardWithTitleAndBody title={`Input`} comp={input}/>
    </Grid>
    <Grid item xs={12} sm={12} md={4}>
      <CardWithTitleAndBody title={`Samples`} comp={samples}/>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <CardWithTitleAndBody title={`Expected Output`} comp={expectedOutput}/>
    </Grid>
    <Grid item xs={12} sm={6} md={6}>
      <CardWithTitleAndBody title={`Transformer`} comp={transformer}/>
    </Grid>
    <Grid item xs={12} sm={6} md={6}>
      <CardWithTitleAndBody title={`Actual Output`} comp={actualOutput}/>
    </Grid>
    <Grid item xs={12} sm={12} md={12}>
      <CardWithTitleAndBody title={`Errors`} comp={errors}/>
    </Grid>
  </Grid>
}


export type TransformerErrorsProps = {
  errors?: TransformerTestResult
}

export function TransformerErrors ( { errors }: TransformerErrorsProps ) {
  const cols = [ 'type', 'Path', 'Message' ]

  function rows () {
    if ( errors === undefined ) return []
    const inserts = errors?.inserts.map ( e => [ 'insert', e.path, e.message ] )
    const deletes = errors?.deletes.map ( e => [ 'delete', e.path, e.message ] )
    const updates = errors?.updates.map ( e => [ 'update', e.path, e.message ] )
    return inserts.concat ( deletes ).concat ( updates )
  }

  return <DataTable rows={rows ()} cols={cols} noData={<div>No errors</div>}/>
}

export type TransformProps={}
export function Transformer({} : TransformProps){

}

export type TransformViewProps = {
  results: TestsResult
}
function makeRows ( tests: OneTestResult[] ) {
  return flatMap ( tests, test => {
    if ( isCannotRunTestResult ( test ) ) return [ [ JSON.stringify ( test.name ), test.errors.join ( ', ' ) ] ]
    const inpName = test[ 'input' ]?.name;
    if ( inpName === undefined ) return []
    const errors = test.input?.result;
    const errorString = errors ? JSON.stringify ( errors ) : 'missing'
    return [ [ lastSegment ( inpName.name ), errorString ] ]
  } )
}
export function TransformView ( { results }: TransformViewProps ) {
  const tests = results.tests
  const initialRow = tests !== undefined && tests.length > 0 ? 0 : undefined
  const [ row, setRow ] = useState<number | undefined> ( initialRow )
  const clickTable = ( col: number, row?: number, ) => setRow ( row )

  const testRow: OneTestResult | undefined = (row !== undefined && isRanTestResult ( tests[ row ] )) ? tests[ row ] : undefined
  const ranTestRow: RanTestResult = testRow as RanTestResult
  const inp = ranTestRow?.[ 'input' ]
  const actualOutput = ranTestRow?.[ 'actualOutput' ]
  const expectedOutput = ranTestRow?.[ 'expectedOutput' ]

  return <TransformViewLayout
    samples={<DataTable selected={row}
                        onClick={clickTable}
                        cols={[ 'Sample', 'Errors' ]}
                        rows={makeRows ( tests )}
                        noData={<div>No samples</div>}/>}
    input={<pre>{JSON.stringify ( inp?.value, null, 2 )}</pre>}
    transformer={<pre>{(results?.transformer?.transformerDesc as any)?.jsonata}</pre>}
    actualOutput={<pre>{JSON.stringify ( actualOutput?.value, null, 2 )}</pre>}
    expectedOutput={<pre>{JSON.stringify ( expectedOutput?.value, null, 2 )}</pre>}
    errors={<TransformerErrors errors={ranTestRow?.actualOutput?.result}/>}
  />
  // return <pre>{JSON.stringify ( results, null, 2 )}</pre>
}