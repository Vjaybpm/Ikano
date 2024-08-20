import { NameAnd } from "@laoban/utils";

export function putIntoFromToMap<T>(ts: T[], from: (t: T) => string, to: (t: T) => string): NameAnd<NameAnd<T>> {
  const map: NameAnd<NameAnd<T>> = {};

  ts.forEach(t => {
    const fromKey = from(t);
    const toKey = to(t);
    if (!map[fromKey]) map[ fromKey ] = {};
    map[fromKey][toKey] = t;
  });

  return map;
}
