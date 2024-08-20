import { Optional } from "@focuson/lens";

export type DDF<S, T> = DDF0<S, T> | DDF1<S, any, T> | DDF2<S, any, any, T> | DDF3<S, any, any, any, T> | DDF4<S, any, any, any, any, T> | DDF5<S, any, any, any, any, any, T>
export function isDDF<S, T> ( dd: DD<S, T> ): dd is DDF<S, T> {
  return !dd.wait
}
export type DDK<S, T> = DDK0<S, T> | DDK1<S, any, T> | DDK2<S, any, any, T> | DDK3<S, any, any, any, T> | DDK4<S, any, any, any, any, T> | DDK5<S, any, any, any, any, any, T>
export function isDDK<S, T> ( dd: DD<S, T> ): dd is DDK<S, T> {
  return dd.wait
}
export type DD<S, T> = DDF<S, T> | DDK<S, T>

export interface DDDecisions {
  wait?: true
  clear?: true
}
export interface DDPrim<S, T> extends DDDecisions {
  name: string
  type: string
  target: Optional<S, T>
  //if the fn blows up this will be called. Note that this can throw errors as well (for example a more descriptive one) but it should be very simple in nature or debugging issues will be hard
  recover?: ( e: any, old: T, params: any[] ) => T
}

export type DDF0<S, T> = DDPrim<S, T> & {
  type: 'dd0',
  fn: ( old: T ) => T
}
export type DDK0<S, T> = DDPrim<S, T> & {
  type: 'dd0',
  wait: true
  fn: ( old: T ) => Promise<T>
}

export type DDF1<S, P1, T> = DDPrim<S, T> & {
  type: 'dd1',
  p1: DD<S, P1>
  fn: ( old: T, p1: P1 ) => T
}
export type DDK1<S, P1, T> = DDPrim<S, T> & {
  type: 'dd1',
  p1: DD<S, P1>
  wait: true
  fn: ( old: T, p1: P1 ) => Promise<T>
}
export type DDF2<S, P1, P2, T> = DDPrim<S, T> & {
  type: 'dd2',
  p1: DD<S, P1>
  p2: DD<S, P2>
  fn: ( old: T, p1: P1, p2: P2 ) => T
}
export type DDK2<S, P1, P2, T> = DDPrim<S, T> & {
  type: 'dd2',
  p1: DD<S, P1>
  p2: DD<S, P2>
  wait: true
  fn: ( old: T, p1: P1, p2: P2 ) => Promise<T>
}
export type DDF3<S, P1, P2, P3, T> = DDPrim<S, T> & {
  type: 'dd3',
  p1: DD<S, P1>
  p2: DD<S, P2>
  p3: DD<S, P3>
  fn: ( old: T, p1: P1, p2: P2, p3: P3 ) => T
}
export type DDK3<S, P1, P2, P3, T> = DDPrim<S, T> & {
  type: 'dd3',
  p1: DD<S, P1>
  p2: DD<S, P2>
  p3: DD<S, P3>
  wait: true
  fn: ( old: T, p1: P1, p2: P2, p3: P3 ) => Promise<T>
}
export type DDF4<S, P1, P2, P3, P4, T> = DDPrim<S, T> & {
  type: 'dd4',
  p1: DD<S, P1>
  p2: DD<S, P2>
  p3: DD<S, P3>
  p4: DD<S, P4>
  fn: ( old: T, p1: P1, p2: P2, p3: P3, p4: P4 ) => T
}
export type DDK4<S, P1, P2, P3, P4, T> = DDPrim<S, T> & {
  type: 'dd4',
  p1: DD<S, P1>
  p2: DD<S, P2>
  p3: DD<S, P3>
  p4: DD<S, P4>
  wait: true
  fn: ( old: T, p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<T>
}
export type DDF5<S, P1, P2, P3, P4, P5, T> = DDPrim<S, T> & {
  type: 'dd5',
  p1: DD<S, P1>
  p2: DD<S, P2>
  p3: DD<S, P3>
  p4: DD<S, P4>
  p5: DD<S, P5>
  fn: ( old: T, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => T
}
export type DDK5<S, P1, P2, P3, P4, P5, T> = DDPrim<S, T> & {
  type: 'dd5',
  p1: DD<S, P1>
  p2: DD<S, P2>
  p3: DD<S, P3>
  p4: DD<S, P4>
  p5: DD<S, P5>
  fn: ( old: T, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<T>
}

export function callDDF<S, T> ( dd: DDF<S, T>, old: T, ps: any[] ): T {
  try {
    switch ( dd.type ) {
      case 'dd0':
        return dd.fn ( old )
      case 'dd1':
        return (dd as DDF1<S, any, T>).fn ( old, ps[ 0 ] )
      case 'dd2':
        return (dd as DDF2<S, any, any, T>).fn ( old, ps[ 0 ], ps[ 1 ] )
      case 'dd3':
        return (dd as DDF3<S, any, any, any, T>).fn ( old, ps[ 0 ], ps[ 1 ], ps[ 2 ] )
      case 'dd4':
        return (dd as DDF4<S, any, any, any, any, T>).fn ( old, ps[ 0 ], ps[ 1 ], ps[ 2 ], ps[ 3 ] )
      case 'dd5':
        return (dd as DDF5<S, any, any, any, any, any, T>).fn ( old, ps[ 0 ], ps[ 1 ], ps[ 2 ], ps[ 3 ], ps[ 4 ] )
    }
  } catch ( e ) {
    if ( dd.recover ) return dd.recover ( e, old, ps )
    throw e
  }
}

export async function callDDK<S, T> ( dd: DDK<S, T>, old: T, ps: any[] ): Promise<T> {
  try {
    switch ( dd.type ) {
      case 'dd0':
        return await (dd as DDK0<S, T>).fn ( old )
      case 'dd1':
        return await (dd as DDK1<S, any, T>).fn ( old, ps[ 0 ] )
      case 'dd2':
        return await (dd as DDK2<S, any, any, T>).fn ( old, ps[ 0 ], ps[ 1 ] )
      case 'dd3':
        return await (dd as DDK3<S, any, any, any, T>).fn ( old, ps[ 0 ], ps[ 1 ], ps[ 2 ] )
      case 'dd4':
        return await (dd as DDK4<S, any, any, any, any, T>).fn ( old, ps[ 0 ], ps[ 1 ], ps[ 2 ], ps[ 3 ] )
      case 'dd5':
        return await (dd as DDK5<S, any, any, any, any, any, T>).fn ( old, ps[ 0 ], ps[ 1 ], ps[ 2 ], ps[ 3 ], ps[ 4 ] )
    }
  } catch ( e ) {
    if ( dd.recover ) return dd.recover ( e, old, ps )
    throw e
  }
}

export function findParams<S, T> ( dd: DD<S, T> ): DD<S, T>[] {
  switch ( dd.type ) {
    case 'dd0':
      return []
    case 'dd1':
      return [ dd.p1 ]
    case 'dd2':
      return [ dd.p1, dd.p2 ]
    case 'dd3':
      return [ dd.p1, dd.p2, dd.p3 ]
    case 'dd4':
      return [ dd.p1, dd.p2, dd.p3, dd.p4 ]
    case 'dd5':
      return [ dd.p1, dd.p2, dd.p3, dd.p4, dd.p5 ]
  }
}