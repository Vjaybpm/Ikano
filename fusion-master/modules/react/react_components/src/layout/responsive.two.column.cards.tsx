import React from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { CardProps } from "@mui/material/Card/Card";

export interface ResponseCardData {
  title: string;
  comp: React.ReactNode;  // This allows any React component to be passed
}

interface CardBodyProps {
  title: string;
  comp: React.ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ( { title, comp } ) => (
  <>{title?.length>0 &&<Typography variant="h5" component="div" gutterBottom>{title}</Typography>}{comp}</>
);


export interface ResponseTwoColumnCardsProps {
  cards: ResponseCardData[];
  singleColumn?: boolean;
}

export type CardWithTitleAndBodyProps = {
  card: ResponseCardData

}
export function CardWithTitleAndBody ( {title,comp,...cardProps}: ResponseCardData & CardProps ) {
  return <Card raised sx={{ height: '100%' }} {...cardProps}>
    <CardContent sx={{ height: '100%' }}>
      <CardBody title={title} comp={comp}/>
    </CardContent>
  </Card>
}
export const ResponseTwoColumnCards: React.FC<ResponseTwoColumnCardsProps> = ( { cards, singleColumn } ) => {
  const columnSize = singleColumn ? 12 : 6; // Default to 2 columns unless forced to 1
  return (
    <Grid container spacing={2}>
      {cards.map ( ( card, index ) => (
        <Grid item xs={12} sm={12} md={columnSize} key={index}>
          <CardWithTitleAndBody {...card} />
        </Grid>
      ) )}
    </Grid>
  );
};


