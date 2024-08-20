
export type K0<T> = () => Promise<T>
export type K1<P1, T> = ( p1: P1 ) => Promise<T>
export type K2<P1, P2, T> = ( p1: P1, p2: P2 ) => Promise<T>
export type K3<P1, P2, P3, T> = ( p1: P1, p2: P2, p3: P3 ) => Promise<T>
export type K4<P1, P2, P3, P4, T> = ( p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<T>
export type K5<P1, P2, P3, P4, P5, T> = ( p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<T>
export type Kleisli<T> = K0<T> | K1<any, T> | K2<any, any, T> | K3<any, any, any, T> | K4<any, any, any, any, T> | K5<any, any, any, any, any, T>
