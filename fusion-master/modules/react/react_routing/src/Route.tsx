import React from "react";
import { useRoute, useRouteVariables } from "./react_routing";
import { extractPathAndQuery } from "./extract.path.variable";
import { NameAnd } from "@laoban/utils";

export function RouteDebug () {
  const path = useRoute ()[ 0 ]
  const pathQuery = extractPathAndQuery ( path )
  const vars = useRouteVariables ( pathQuery.path )
  return <pre>RouteDebug {JSON.stringify ( { route: path, ...pathQuery, vars}, null, 2 )}</pre>
}

export type RouteProps<T> = {
  path: string
  children: React.ReactNode
}
export function Route<T> ( { path, children }: RouteProps<T> ): React.ReactElement {
  const vars = useRouteVariables ( path )
  if ( vars === null ) return <></>
  return <>{children}</>
}

export type RouteVarsProps = {
  path: string
  children: ( params: NameAnd<string> ) => React.ReactNode
}
export function RouteVars ( { path, children }: RouteVarsProps ): React.ReactElement {
  const vars = useRouteVariables ( path )
  if ( vars === null ) return <></>
  return <>{children ( vars )}</>
}
