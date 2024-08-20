import { Task } from "../state/fusion.state";
import { LensProps2 } from "@focuson/state";
import { RouteVars } from "@fusionconfig/react_routing";
import React from "react";
import { ErrorsAnd, hasErrors, NameAnd } from "@laoban/utils";
import { ReqRespAction } from "../state/test.selection";
import { ReqRespTestsResult, TestsResult } from "@fusionconfig/tests";
import { TestTable } from "./tests.view";
import { Stack, Typography } from "@mui/material";
import { SchemaView } from "./schema.view";
import { CardWithTitleAndBody, ErrorOr } from "@fusionconfig/react_components";
import { TransformView } from "./transform.view";

export function trimName ( name: string ) {
  return name.substring ( 5 )
}

export type TestSummaryProps<S> = LensProps2<S, ReqRespAction, string, any> & { taskName: string, task?: Task, testResult: ErrorsAnd<ReqRespTestsResult> | undefined }
export function TestSummary<S> ( { state, taskName, testResult, task }: TestSummaryProps<S> ) {
  if ( task === undefined ) return <div>No task</div>
  if ( testResult === undefined ) return <div>No tests</div>

  if ( hasErrors ( testResult ) ) return <pre>{JSON.stringify ( testResult, null, 2 )}</pre>
  return  <CardWithTitleAndBody title='' comp={

  <Stack spacing={1}>
    <Typography>Request: {taskName} ({trimName ( task.request.schema.name )}) ===&gt; {task.service} ({trimName ( task.request.kafka.name )}).</Typography>
    <TestTable tests={testResult.request.tests}/>
    <Typography>Response: {taskName} ({trimName ( task.response.schema.name )}) &lt;=== {task.service} ({trimName ( task.response.kafka.name )}).</Typography>
    <TestTable tests={testResult.response.tests}/>
  </Stack>}/>

}

export type TestsDetailsPageProps<S> = LensProps2<S, ReqRespAction, string, any> & {
  tasks: NameAnd<Task>,
  testResult: ErrorsAnd<ReqRespTestsResult> | undefined
}


export function TestsDetailsPage<S> ( { state, tasks, testResult }: TestsDetailsPageProps<S> ) {
  return <>
    <RouteVars path='/task/{task}/Summary'>{( { task } ) =>
      <TestSummary task={tasks[ task ]} taskName={task} testResult={testResult} state={state}/>}</RouteVars>

    <RouteVars path='/task/{task}/TaskRequestInput'>{( { task } ) =>
      <ErrorOr value={testResult}>{tr =>
        <SchemaView nameAndSchema={tr.request.inputSchema} result='input' tests={tr.request.tests}/>}</ErrorOr>}</RouteVars>

    <RouteVars path='/task/{task}/RequestTransform'>{( { task } ) =>
      <ErrorOr value={testResult}>{tr =>
        <TransformView results={tr.request} />}</ErrorOr>}</RouteVars>



    <RouteVars path='/task/{task}/ServiceRequestInput'>{( { task } ) =>
      <ErrorOr value={testResult}>{tr =>
        <SchemaView nameAndSchema={tr.request.outputSchema} result='expectedOutput' tests={tr.request.tests}/>}</ErrorOr>}</RouteVars>

    <RouteVars path='/task/{task}/ServiceResponseOutput'>{( { task } ) =>
      <ErrorOr value={testResult}>{tr =>
        <SchemaView nameAndSchema={tr.response.inputSchema} result='input' tests={tr.response.tests}/>}</ErrorOr>}</RouteVars>

    <RouteVars path='/task/{task}/ResponseTransform'>{( { task } ) =>
      <ErrorOr value={testResult}>{tr =>
        <TransformView results={tr.response} />}</ErrorOr>}</RouteVars>


    <RouteVars path='/task/{task}/TaskResponseOutput'>{( { task } ) =>
      <ErrorOr value={testResult}>{tr =>
        <SchemaView nameAndSchema={tr.response.outputSchema} result='expectedOutput' tests={tr.response.tests}/>}</ErrorOr>}</RouteVars>
  </>
}

