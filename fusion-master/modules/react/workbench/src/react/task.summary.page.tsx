import React from "react";
import { LensProps } from "@focuson/state";
import { Task } from "../state/fusion.state";
import { NameAnd, toArray } from "@laoban/utils";
import { Paper, Typography } from "@mui/material";
import { ResponseTwoColumnCards } from "@fusionconfig/react_components";


export type TaskSummaryPageProps<S> = LensProps<S, NameAnd<Task>, any> & { task: string | undefined, singleColumn?: boolean }

export type TaskSummaryProps = { task: string | undefined, data: Task }
export function TaskSummary ( { task, data }: TaskSummaryProps ) {
  return <Typography variant="body1" paragraph>
    <Typography>Name: {task} </Typography>
    <Typography>{data.taskDescription} </Typography>
    <Typography>Variables: {toArray ( data.variables ).join ( ', ' )}</Typography>
  </Typography>

}

export type TaskProps = { data: Task }
export function ServiceSummary ( { data }: TaskProps ) {
  return <>
    <Typography variant="h6">{data.service}</Typography>
    <Typography variant="subtitle1">{data.serviceDescription}</Typography>
  </>
}

export function RequestSummary ( { data }: TaskProps ) {
  return <>
    <Typography>Topic: {data.request.topic}</Typography>
    <Typography>Kafka Schema: {data.request.kafka.name}</Typography>
    <Typography>Schema ID: {data.request.schema.id}</Typography>
    <Typography>Transformer: {data.request.transformer.name}</Typography>
  </>
}
export function ResponseSummary ( { data }: TaskProps ) {
  return <>
    <Typography>Topic: {data.response.topic}</Typography>
    <Typography>Kafka Schema: {data.response.kafka.name}</Typography>
    <Typography>Schema ID: {data.response.schema.id}</Typography>
    <Typography>Transformer: {data.response.transformer.name}</Typography>
  </>

}
export function TaskSummaryPage<S> ( { state, task, singleColumn }: TaskSummaryPageProps<S> ) {
  const data: Task = (state.optJson () || {})[ task || '' ]
  if ( data === undefined ) return <Paper style={{ padding: 20 }}/>
  return <><ResponseTwoColumnCards singleColumn={singleColumn} cards={[
    { title: 'Task', comp: <TaskSummary task={task} data={data}/> },
    { title: 'Service', comp: <ServiceSummary data={data}/> },
    { title: 'Request', comp: <RequestSummary data={data}/> },
    { title: 'Response', comp: <ResponseSummary data={data}/> }
  ]}/></>
}
