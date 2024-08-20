import { LensProps, LensState } from "@focuson/state";
import React from "react";

export type LoadingProps<S, T> = LensProps<S, T, any> & {
  children: ( s: LensState<S, T, any> ) => React.ReactNode
}
export function Loading<S, T> ( { state, children }: LoadingProps<S, T> ) {
  const json = state.optJson ()
  return json === undefined ? <div>Loading...</div> : <>{children(state)}</>;
}