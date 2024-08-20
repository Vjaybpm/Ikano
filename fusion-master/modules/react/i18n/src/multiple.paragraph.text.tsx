import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { flatMap, toArray } from "@laoban/utils";

interface MultiParagraphTextProps {
  i18nKey: string | string[]; // Comma-separated keys
}

export const MultiParagraphText: React.FC<MultiParagraphTextProps> = ( { i18nKey } ) => {
  const { t } = useTranslation ();
  // Split the i18nKey string by commas to handle multiple keys
  const keys = toArray ( i18nKey );
  // Reduce the keys to a single array containing all paragraphs
  const paragraphs = flatMap ( keys, key =>
    toArray ( t ( key, { returnObjects: true } ) as string | string[] ) );

  return (
    <>
      {paragraphs.map ( ( paragraph, index ) => (
        <Typography key={index} variant="body1" paragraph>
          {paragraph}
        </Typography>
      ) )}
    </>
  );
};

