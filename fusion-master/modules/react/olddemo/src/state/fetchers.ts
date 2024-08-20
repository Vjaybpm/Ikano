//If the current != selected go load
import { Optional } from "@focuson/lens";
import { NameAnd } from "@laoban/utils";

export type Predicate<S> = (s: S) => boolean

export function needToLoadIfStringDifferentOrUndefined<S> ( curL: Optional<S, string>, sellL: Optional<S, string> ): ( s: S ) => boolean {
  return s => {
    const current = curL.getOption ( s )
    if ( current === undefined ) return true
    const selected = sellL.getOption ( s )
    if ( selected !== current ) return true
    return false
  }
}
export function needToLoadIfNameAndStringDifferentOrUndefined<S> ( curL: Optional<S, NameAnd<string | undefined>>, sellL: Optional<S, NameAnd<string | undefined>> ): ( s: S ) => boolean {
  return s => {
    const selected = sellL.getOption ( s )
    if ( selected === undefined ) return false
    const current = curL.getOption ( s )
    if ( current === undefined ) return true
    const currentKeys = Object.keys ( current ).sort ()
    const selectedKeys = Object.keys ( selected ).sort ()
    return selectedKeys.toString () !== current.toString ()
  }
}
