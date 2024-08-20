import React from "react";

import { Grid, Paper, Stack, Typography } from "@mui/material";
import { CardWithTitleAndBody, FocusOnSetValueButton } from "@fusionconfig/react_components";
import { TaskProps } from "./task.summary.page";
import { ErrorsAnd, NameAnd, toArray } from "@laoban/utils";
import { MultiParagraphText } from "@fusionconfig/i18n";
import { LensProps, LensProps2 } from "@focuson/state";
import { TestsDetailsPage } from "./tests.details.page";
import { ReqRespAction, requestTranform, responseTransform, serviceRequestInput, serviceResponseOutput, summary, taskRequestInput, taskResponseOutput } from "../state/test.selection";
import { Task } from "../state/fusion.state";
import { ReqRespTestsResult, TestsResult } from "@fusionconfig/tests";
import { splitAndCapitalize } from "@itsmworkbench/utils";

export type TaskDetailsLayoutProps = {
  task: React.ReactElement
  requestResponse: React.ReactElement
  service: React.ReactElement
  tests: React.ReactElement
}

export const TaskDetailsLayout: React.FC<TaskDetailsLayoutProps> = ( { task, requestResponse, service, tests } ) => {
  return (
    <Grid container spacing={2}>
      {/* Task on the left */}
      <Grid item xs={12} sm={4}>{task}
      </Grid>

      {/* Request and Response in the middle, centered vertically */}
      <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CardWithTitleAndBody title='' comp={requestResponse} sx={{ margin: '10px' }}/>
      </Grid>

      {/* Service on the right */}
      <Grid item xs={12} sm={4}>{service} </Grid>
      <Grid item xs={12} sm={12}>
        {tests}
      </Grid>
    </Grid>
  );
};

export type TaskDetailsProps = { taskName: string | undefined, task: Task }
export function TaskDetails ( { taskName, task }: TaskDetailsProps ) {
  return <CardWithTitleAndBody title={`Task: ${splitAndCapitalize ( taskName )}`} comp={
    <Typography variant="body1" paragraph>
      <MultiParagraphText i18nKey={[ "fusion.task.description" ]}/>
      <hr/>
      <Typography>Name: {taskName} </Typography>
      <Typography>{task.taskDescription} </Typography>
      <Typography>Variables: {toArray ( task.variables ).join ( ', ' )}</Typography>
    </Typography>}/>
}

export function ServiceDetails ( { data }: TaskProps ) {
  return <CardWithTitleAndBody title={`Service: ${splitAndCapitalize(data.service)}`} comp={<>
    <MultiParagraphText i18nKey={[ "fusion.service.description" ]}/>
    <hr/>
    <Typography variant="h6">{data.service}</Typography>
    <Typography variant="subtitle1">{data.serviceDescription}</Typography></>}/>

}
export type ReqOrRespSummaryProps<S> = LensProps<S, ReqRespAction, any>
let fontSize = '0.5rem';
export function RequestSummary<S> ( { state }: ReqOrRespSummaryProps<S> ) {
  return <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'space-around', padding: 1, }}> {/* Adjust spacing and padding as needed */}
    <FocusOnSetValueButton size='small' sx={{ fontSize }} title='Task Request Schema' valueToSet={taskRequestInput} state={state}/>
    &nbsp;&gt;&nbsp;
    <FocusOnSetValueButton size='small' sx={{ fontSize }} title='Transform' valueToSet={requestTranform} state={state}/>
    &nbsp;&gt;&nbsp;
    <FocusOnSetValueButton size='small' sx={{ fontSize }} title='Service Request Schema' valueToSet={serviceRequestInput} state={state}/>
    &nbsp;&gt;&nbsp;
  </Stack>
}
export function ResponseSummary<S> ( { state }: ReqOrRespSummaryProps<S> ) {
  return <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'space-around', padding: 1 }}> {/* Adjust spacing and padding as needed */}
    &nbsp;&lt;&nbsp;
    <FocusOnSetValueButton size='small' sx={{ fontSize }} title='Task Response Schema' valueToSet={taskResponseOutput} state={state}/>
    &nbsp;&lt;&nbsp;
    <FocusOnSetValueButton size='small' sx={{ fontSize }} title='Transform' valueToSet={responseTransform} state={state}/>
    &nbsp;&lt;&nbsp;
    <FocusOnSetValueButton size='small' sx={{ fontSize }} title='Service Response Schema' valueToSet={serviceResponseOutput} state={state}/>
  </Stack>
}
export function RequestResponse<S> ( { state }: ReqOrRespSummaryProps<S> ) {
  return <Stack direction='column' spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'space-around', padding: 1 }}>
    <FocusOnSetValueButton size='small' sx={{ fontSize, width: '10rem' }} title='Summary' valueToSet={summary} state={state}/>
    <RequestSummary state={state}/>
    <ResponseSummary state={state}/>
  </Stack>

}
export type TaskDetailsPageProps<S> = LensProps2<S, ReqRespAction, string, any> & { task: string | undefined, tasks?: NameAnd<Task>, testResult?: ErrorsAnd<ReqRespTestsResult> }
export function TaskDetailsPage<S> ( { state, task, tasks, testResult }: TaskDetailsPageProps<S> ) {
  if ( tasks === undefined ) return <div>No tasks</div>
  if ( task === undefined ) return <div>No task name</div>
  const data: Task = (tasks)[ task || '' ]
  if ( data === undefined ) return <div>No task</div>
  return <Paper style={{ padding: 20 }}>
    <TaskDetailsLayout task={<TaskDetails task={data} taskName={task}/>}
                       requestResponse={<RequestResponse state={state.state1 ()}/>}
                       service={<ServiceDetails data={data}/>}
                       tests={<TestsDetailsPage tasks={tasks} testResult={testResult} state={state}/>}
    />

  </Paper>
}
