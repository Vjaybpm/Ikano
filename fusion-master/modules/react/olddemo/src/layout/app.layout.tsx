// HOC for the layout
import React from 'react';
import { WithCard } from "./with.card";
import { TwoByTwo } from './two.by.two.layout';
import { MainAppLayout } from "./main.app.layout";
import { Toolbar } from '@mui/material';

export interface FusionWorkbenchLayoutProps {
  directoryTreeComponent: React.ReactNode;
  inputDataComponent: React.ReactNode;
  editorComponent: React.ReactNode;
  outputDataComponent: React.ReactNode;
  validationErrorsComponent: React.ReactNode;
}


export function FusionWorkbenchLayout ( { directoryTreeComponent, inputDataComponent, editorComponent, outputDataComponent, validationErrorsComponent }: FusionWorkbenchLayoutProps ) {
  return (
    <MainAppLayout title='Fusion Workbench' Nav={directoryTreeComponent} Details={<div>Details</div>}>
      <Toolbar/>
      <Toolbar/>
      <TwoByTwo>
        <WithCard title="Input">{inputDataComponent}</WithCard>
        <WithCard title="Edit">{editorComponent}</WithCard>
        <WithCard title="Output">{outputDataComponent}</WithCard>
        <WithCard title="Errors">{validationErrorsComponent}</WithCard>
      </TwoByTwo>
    </MainAppLayout>
  );
}


