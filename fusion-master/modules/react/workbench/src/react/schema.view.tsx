import { isCannotRunTestResult, isRanTestResult, NameAndSchema, NameAndValueAndSchemaResult, OneTestResult, RanTestResult, RanTestSchemaName, SchemaTestError, SchemaTestResult } from "@fusionconfig/tests";
import { Grid } from "@mui/material";
import React, { useState } from "react";
import { CardWithTitleAndBody, DataTable } from "@fusionconfig/react_components";
import { flatMap, lastSegment } from "@laoban/utils";

export type SchemaViewLayoutProps = {
  samples: React.ReactElement
  sample: React.ReactElement
  schema: React.ReactElement
  errors: React.ReactElement
}
export function SchemaViewLayout ( { samples, sample, schema, errors }: SchemaViewLayoutProps ) {
  return <Grid container spacing={2}>
    <Grid item xs={12} sm={12} md={4}>
      {schema}
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      {samples}
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      {sample}
    </Grid>
    <Grid item xs={12} sm={12} md={12}>
      {errors}
    </Grid>
  </Grid>
}


export type SchemaViewProps = {
  nameAndSchema: NameAndSchema
  tests: OneTestResult[]
  result: RanTestSchemaName
}

function makeRows ( tests: OneTestResult[], result: RanTestSchemaName ) {
  return flatMap ( tests, test => {
    if ( isCannotRunTestResult ( test ) ) return [ [ JSON.stringify ( test.name ), test.errors.join ( ', ' ) ] ]
    const inpName = test[ result ]?.name;
    if ( inpName === undefined ) return []
    const errors = test.input?.result;
    const errorString = errors ? JSON.stringify ( errors ) : 'missing'
    return [ [ lastSegment ( inpName.name ), errorString ] ]
  } )
}

export type SampleProps = {
  nvsr: NameAndValueAndSchemaResult | undefined
}
export function Sample ( { nvsr }: SampleProps ) {
  if ( nvsr === undefined ) return <></>
  return <>
    <pre>{JSON.stringify ( nvsr.value, null, 2 )}</pre>
  </>
}

export type SchemaErrorsProps = {
  errors?: SchemaTestResult
}

export function SchemaErrors ( { errors }: SchemaErrorsProps ) {
  const cols = [ 'Path', 'Message' ]

  let errArray: SchemaTestError[] = errors === undefined ? [] : errors as SchemaTestError[];
  const rows = errArray.map ( ( e: SchemaTestError ) => [ e.path, e.message ] )
  return <DataTable rows={rows} cols={cols} noData={<div>No errors</div>}/>
}

export function SchemaView ( { nameAndSchema, tests, result }: SchemaViewProps ) {
  const initialRow = tests !== undefined && tests.length > 0 ? 0 : undefined
  const [ row, setRow ] = useState<number | undefined> ( initialRow )
  const clickTable = ( col: number, row?: number, ) => setRow ( row )

  const testRow: OneTestResult | undefined = (row !== undefined && isRanTestResult ( tests[ row ] )) ? tests[ row ] : undefined
  const ranTestRow: RanTestResult = testRow as RanTestResult
  const nvsr = ranTestRow?.[ result ]
  return <>
    <SchemaViewLayout
      schema={<CardWithTitleAndBody title={`Schema ${nameAndSchema?.name?.name}`} comp={<pre>{JSON.stringify ( nameAndSchema?.schema, null, 2 )}</pre>}/>}
      samples={<CardWithTitleAndBody title={`Samples`}
                                     comp={<DataTable selected={row} onClick={clickTable} cols={[ 'Sample', 'Errors' ]}
                                                      rows={makeRows ( tests, result )}
                                                      noData={<div>No samples</div>}></DataTable>}/>}
      sample={<CardWithTitleAndBody title={`Sample ${nvsr?.name?.name}`} comp={<Sample nvsr={nvsr}/>}/>}
      errors={<CardWithTitleAndBody title={`Errors`} comp={<SchemaErrors errors={nvsr?.result}/>}/>}
    /> </>
}