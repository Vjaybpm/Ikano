import { Optional } from "@focuson/lens";
import { DD, DDF, DDF0, DDF1, DDF2, DDF3, DDF4, DDF5, DDK, DDK0, DDK1, DDK2, DDK3, DDK4, DDK5 } from "./dependent.data.domain";

export type DDConfig<T> = {
  clear?: true
  recover?: ( e: any, old: T, params: any[] ) => T
}

export function depData<S, T> ( name: string,
                                target: Optional<S, T>,
                                fn: ( old: T ) => T,
                                config: DDConfig<T> ): DDF0<S, T> ;
export function depData<S, P1, T> ( name: string,
                                    target: Optional<S, T>,
                                    fn: ( old: T, p1: P1 ) => T,
                                    p1: DD<S, P1>,
                                    config: DDConfig<T> ): DDF1<S, P1, T> ;
export function depData<S, P1, P2, T> ( name: string,
                                        target: Optional<S, T>,
                                        fn: ( old: T, p1: P1, p2: P2 ) => T,
                                        p1: DD<S, P1>,
                                        p2: DD<S, P2>,
                                        config: DDConfig<T> ): DDF2<S, P1, P2, T> ;
export function depData<S, P1, P2, P3, T> ( name: string,
                                            target: Optional<S, T>,
                                            fn: ( old: T, p1: P1, p2: P2, p3: P3 ) => T,
                                            p1: DD<S, P1>,
                                            p2: DD<S, P2>,
                                            p3: DD<S, P3>,
                                            config: DDConfig<T> ): DDF3<S, P1, P2, P3, T> ;
export function depData<S, P1, P2, P3, P4, T> ( name: string,
                                                target: Optional<S, T>,
                                                fn: ( old: T, p1: P1, p2: P2, p3: P3, p4: P4 ) => T,
                                                p1: DD<S, P1>,
                                                p2: DD<S, P2>,
                                                p3: DD<S, P3>,
                                                p4: DD<S, P4>,
                                                config: DDConfig<T> ): DDF4<S, P1, P2, P3, P4, T> ;
export function depData<S, P1, P2, P3, P4, P5, T> ( name: string,
                                                    target: Optional<S, T>,
                                                    fn: ( old: T, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => T,
                                                    p1: DD<S, P1>,
                                                    p2: DD<S, P2>,
                                                    p3: DD<S, P3>,
                                                    p4: DD<S, P4>,
                                                    p5: DD<S, P5>,
                                                    config: DDConfig<T> ): DDF5<S, P1, P2, P3, P4, P5, T> ;

export function depData<S, P1, P2, P3, P4, P5, T> ( name: string,
                                                    target: Optional<S, T>,
                                                    fn: ( old: T, p1?: P1, p2?: P2, p3?: P3, p4?: P4, p5?: P5 ) => T,
                                                    p1: DD<S, P1> | DDConfig<T>,
                                                    p2?: DD<S, P2> | DDConfig<T>,
                                                    p3?: DD<S, P3> | DDConfig<T>,
                                                    p4?: DD<S, P4> | DDConfig<T>,
                                                    p5?: DD<S, P5> | DDConfig<T>,
                                                    config?: DDConfig<T> ): DDF<S, T> {
  if ( arguments.length === 9 ) {
    let res: DDF5<S, P1, P2, P3, P4, P5, T> = { name, target, fn, type: 'dd5', p1: p1 as DD<S, P1>, p2: p2 as DD<S, P2>, p3: p3 as DD<S, P3>, p4: p4 as DD<S, P4>, p5: p5 as DD<S, P5>, ...(config || {}) };
    return res
  }
  if ( arguments.length === 8 ) {
    let res: DDF4<S, P1, P2, P3, P4, T> = { name, target, fn, type: 'dd4', p1: p1 as DD<S, P1>, p2: p2 as DD<S, P2>, p3: p3 as DD<S, P3>, p4: p4 as DD<S, P4>, ...(p5 as DDConfig<T> || {}) };
    return res
  }
  if ( arguments.length === 7 ) {
    let res: DDF3<S, P1, P2, P3, T> = { name, target, fn, type: 'dd3', p1: p1 as DD<S, P1>, p2: p2 as DD<S, P2>, p3: p3 as DD<S, P3>, ...(p4 as DDConfig<T> || {}) };
    return res
  }
  if ( arguments.length === 6 ) {
    let res: DDF2<S, P1, P2, T> = { name, target, fn, type: 'dd2', p1: p1 as DD<S, P1>, p2: p2 as DD<S, P2>, ...(p3 as DDConfig<T> || {}) };
    return res
  }
  if ( arguments.length === 5 ) {
    let res: DDF1<S, P1, T> = { name, target, fn, type: 'dd1', p1: p1 as DD<S, P1>, ...(p2 as DDConfig<T> || {}) };
    return res
  }
  if ( arguments.length === 4 ) {
    let res: DDF0<S, T> = { name, target, fn, type: 'dd0', ...(p1 as DDConfig<T> || {}) };
    return res
  }
  throw new Error ( "Invalid number of arguments for depData function" );
}
export type DDConfigK<T> = DDConfig<T> & {
  clearIfLoad?: true
}
export function depDataK<S, T> ( name: string,
                                 target: Optional<S, T>,
                                 fn: ( old: T ) => Promise<T>,
                                 config: DDConfigK<T> ): DDK0<S, T> ;
export function depDataK<S, P1, T> ( name: string,
                                     target: Optional<S, T>,
                                     fn: ( old: T, p1: P1 ) => Promise<T>,
                                     p1: DD<S, P1>,
                                     config: DDConfigK<T> ): DDK1<S, P1, T> ;
export function depDataK<S, P1, P2, T> ( name: string,
                                         target: Optional<S, T>,
                                         fn: ( old: T, p1: P1, p2: P2 ) => Promise<T>,
                                         p1: DD<S, P1>,
                                         p2: DD<S, P2>,
                                         config: DDConfigK<T> ): DDK2<S, P1, P2, T> ;
export function depDataK<S, P1, P2, P3, T> ( name: string,
                                             target: Optional<S, T>,
                                             fn: ( old: T, p1: P1, p2: P2, p3: P3 ) => Promise<T>,
                                             p1: DD<S, P1>,
                                             p2: DD<S, P2>,
                                             p3: DD<S, P3>,
                                             config: DDConfigK<T> ): DDK3<S, P1, P2, P3, T> ;
export function depDataK<S, P1, P2, P3, P4, T> ( name: string,
                                                 target: Optional<S, T>,
                                                 fn: ( old: T, p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<T>,
                                                 p1: DD<S, P1>,
                                                 p2: DD<S, P2>,
                                                 p3: DD<S, P3>,
                                                 p4: DD<S, P4>,
                                                 config: DDConfigK<T> ): DDK4<S, P1, P2, P3, P4, T> ;
export function depDataK<S, P1, P2, P3, P4, P5, T> ( name: string,
                                                     target: Optional<S, T>,
                                                     fn: ( old: T, p1: P1, p2: P2, p3: P3, P4: P4, p5: P5 ) => Promise<T>,
                                                     p1: DD<S, P1>,
                                                     p2: DD<S, P2>,
                                                     p3: DD<S, P3>,
                                                     p4: DD<S, P4>,
                                                     p5: DD<S, P5>,
                                                     config: DDConfigK<T> ): DDK5<S, P1, P2, P3, P4, P5, T> ;

export function depDataK<S, P1, P2, P3, P4, P5, T> ( name: string,
                                                     target: Optional<S, T>,
                                                     fn: ( old: T, p1?: P1, p2?: P2, p3?: P3, p4?: P4, p5?: P5 ) => Promise<T>,
                                                     p1: DD<S, P1> | DDConfig<T>,
                                                     p2?: DD<S, P2> | DDConfig<T>,
                                                     p3?: DD<S, P3> | DDConfig<T>,
                                                     p4?: DD<S, P4> | DDConfig<T>,
                                                     p5?: DD<S, P5> | DDConfig<T>,
                                                     config?: DDConfigK<T> ): DDK<S, T> {
  if ( arguments.length === 9 ) {
    let res: DDK<S, T> = { name, target, fn, type: 'dd5', p1: p1 as DD<S, P1>, p2: p2 as DD<S, P2>, p3: p3 as DD<S, P3>, p4: p4 as DD<S, P4>, p5: p5 as DD<S, P5>, wait: true, ...(config || {}) };
    return res
  }
  if ( arguments.length === 8 ) {
    let res: DDK<S, T> = { name, target, fn, type: 'dd4', p1: p1 as DD<S, P1>, p2: p2 as DD<S, P2>, p3: p3 as DD<S, P3>, p4: p4 as DD<S, P4>, wait: true, ...(p5 as DDConfig<T> || {}) };
    return res
  }
  if ( arguments.length === 7 ) {
    let res: DDK<S, T> = { name, target, fn, type: 'dd3', p1: p1 as DD<S, P1>, p2: p2 as DD<S, P2>, p3: p3 as DD<S, P3>, wait: true, ...(p4 as DDConfig<T> || {}) };
    return res
  }
  if ( arguments.length === 6 ) {
    let res: DDK<S, T> = { name, target, fn, type: 'dd2', p1: p1 as DD<S, P1>, p2: p2 as DD<S, P2>, wait: true, ...(p3 as DDConfig<T> || {}) };
    return res
  }
  if ( arguments.length === 5 ) {
    let res: DDK<S, T> = { name, target, fn, type: 'dd1', p1: p1 as DD<S, P1>, wait: true, ...(p2 as DDConfig<T> || {}) };
    return res
  }
  if ( arguments.length === 4 ) {
    let res: DDK<S, T> = { name, target, fn, type: 'dd0', wait: true, ...(p1 as DDConfig<T> || {}) };
    return res
  }
  throw new Error ( "Invalid number of arguments for depDataK function" );
}


