import { FusionWorkbenchState, rawConfigL, routeTemplateNameL, Task, taskL } from "../state/fusion.state";
import { LensProps } from "@focuson/state";
import { CardWithTitleAndBody, ResponsiveSelectableGridSize4 } from "@fusionconfig/react_components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { MultiParagraphText } from "@fusionconfig/i18n";
import { findLines } from "./files.details";
import { NameAnd } from "@laoban/utils";

export type TaskOnHomePageProps = { taskName: string, task: Task }
export function TaskOnHomePage ( { taskName, task }: TaskOnHomePageProps ) {
  return <>
    <Typography>Name: {taskName}</Typography>
    <Typography>{task.taskDescription}</Typography>
    <hr/>
    <Typography variant="subtitle1">Kafka Topic: {task.request.topic}</Typography>
    <Typography>{task.serviceDescription}</Typography>
  </>

}
export function TaskOnHomeCardPage ( { taskName, task }: TaskOnHomePageProps ) {
  return <CardWithTitleAndBody title={splitAndCapitalize ( taskName )} comp={<TaskOnHomePage task={task} taskName={taskName}/>}/>
}

export type HomePageLayoutProps = {
  tasks: React.ReactElement
  description: React.ReactElement
  foundLines: React.ReactElement
  notFoundLines: React.ReactElement
}
export function HomePageLayout ( { tasks, description, foundLines, notFoundLines }: HomePageLayoutProps ) {
  return <Stack spacing={2}>
    {tasks}
    <Grid container spacing={2}>
      <Grid item xs={12} sm={12} md={12}>
        {description}
      </Grid>
    </Grid>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={6}>
        {foundLines}
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        {notFoundLines}
      </Grid>
    </Grid>
  </Stack>
}


export function HomePage<S> ( { state }: LensProps<S, FusionWorkbenchState, any> ) {
  const s = state.optJson ()
  const items: NameAnd<Task> = s?.config?.tasks || {}
  const { foundLines, notFoundLines } = findLines ( state.chainLens ( rawConfigL ).optJson () )
  return <HomePageLayout
    tasks={
      <ResponsiveSelectableGridSize4 onClick={( name: string ) => state.doubleUp ().chain1 ( taskL ).chain2 ( routeTemplateNameL ).setJson ( name, 'task', '' )}
                                     items={items}
                                     children={( name, task: Task ) => <TaskOnHomeCardPage taskName={name} task={task}/>}/>}
    description={
      <CardWithTitleAndBody title='What you can see' sx={{ height: undefined }} comp={<MultiParagraphText i18nKey={[ "fusion.home.description" ]}/>}/>
    } foundLines={
    <CardWithTitleAndBody title='Files used to define the config' comp={
      <>{foundLines.map ( ( l, i ) => <Typography style={{ wordWrap: 'break-word' }} key={i}>{l}</Typography> )}</>}/>
  } notFoundLines={
    <CardWithTitleAndBody title={`Files that could be used to define the config, but don't exist`} comp={
      <>{notFoundLines.map ( ( l, i ) => <Typography style={{ wordWrap: 'break-word' }} key={i}>{l}</Typography> )}</>}/>
  }/>
}