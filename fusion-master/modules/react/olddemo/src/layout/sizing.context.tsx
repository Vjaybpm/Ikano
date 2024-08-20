// SizingContext.tsx
import React, { createContext, useContext, ReactNode, useState } from 'react';

// Define the shape of the context
export interface SizingData {
  leftDrawerWidth: string;
  rightDrawerWidth: string;
}

// Create the context with a default value
export const SizingContext = createContext<SizingData | undefined> ( undefined );


// Custom hook to use the context
export const useSizing = () => {
  const context = useContext ( SizingContext );
  if ( context === undefined ) {
    throw new Error ( 'useSizing must be used within a SizingProvider' );
  }
  return context;
};
``
