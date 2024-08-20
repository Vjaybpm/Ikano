import { configLegalTasksL, FusionWorkbenchState, taskL } from "../state/fusion.state";
import { LensProps } from "@focuson/state";
import { HideNavButton } from "@fusionconfig/react_components/src/buttons/hide.nav.button";
import { Loading, SingleSelect } from "@fusionconfig/react_components";
import React from "react";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { TaskSummaryPage } from "./task.summary.page";
import { FilesDetails } from "./files.details";
import { Stack } from "@mui/material";

export type FusionDetailsProps<S> = LensProps<S, FusionWorkbenchState, any> & {}
export function FusionDetails<S> ( { state }: FusionDetailsProps<S> ) {
  const fws = state.optJson ()
  const task = fws?.selectionState?.task
  const selectTaskTitle = task ? `Selected Task: ${splitAndCapitalize ( task )}` : 'No Selected Task'
  return <Stack spacing={1}>
    <HideNavButton title={selectTaskTitle}><Loading state={state.focusOn ( 'config' ).focusOn ( 'tasks' )}>{s =>
      <TaskSummaryPage singleColumn={true} task={task} state={s}/>}</Loading></HideNavButton>
    <HideNavButton title='Files'><Loading state={state.focusOn ( 'rawConfig' )}>{s => <FilesDetails state={s}/>}</Loading></HideNavButton>
    <HideNavButton title='Main config'><Loading state={state.focusOn ( 'rawConfig' )}>{s =>
      <pre>{s.optJson ()}</pre>}</Loading></HideNavButton>
  </Stack>

}