import React from 'react';
import { Card, CardContent, Typography, CardHeader } from '@mui/material';

export interface WithCardProps {
  title: string;
  children: React.ReactNode
}

export function WithCard ( { title, children }: WithCardProps ) {
  return <Card variant="outlined">
    <CardHeader title={title}/>
    <CardContent>{children}</CardContent>
  </Card>

}
