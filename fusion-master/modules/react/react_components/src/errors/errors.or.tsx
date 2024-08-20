import { LensState } from "@focuson/state";
import { ErrorsAnd, hasErrors } from "@laoban/utils";
import React from "react";

export type ErrorsOrProps<S, T> = {
  value: ErrorsAnd<T>
  context?: string
  children: (t:NonNullable<T>) => React.ReactElement
}

export function ErrorOr<S, T> ( { value, context, children }: ErrorsOrProps<S, T> ) {
  if ( !value ) return <div>{context} undefined</div>
  if ( hasErrors ( value ) ) return <>{context}
    <pre>{JSON.stringify ( value, null, 2 )}</pre>
  </>
  const castState = value as NonNullable<T>
  return <>{children ( castState )}</>
}