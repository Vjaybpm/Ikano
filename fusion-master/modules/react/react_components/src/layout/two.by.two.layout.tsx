import React, { ReactElement } from 'react';
import Grid from '@mui/material/Grid';

// Define the props to accept an array of exactly four ReactElement items
export type TwoByTwoProps = {
  children: [ ReactElement, ReactElement, ReactElement, ReactElement ];
};

export function TwoByTwo ( { children }: TwoByTwoProps ) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        {children[ 0 ]}
      </Grid>
      <Grid item xs={6}>
        {children[ 1 ]}
      </Grid>
      <Grid item xs={6}>
        {children[ 2 ]}
      </Grid>
      <Grid item xs={6}>
        {children[ 3 ]}
      </Grid>
    </Grid>
  );
}
