import { Merged } from "./merge";

export function findStringArray ( merged: Merged): string[] {
  let value = merged.value;
  if ( !Array.isArray ( value ) ) return []
  return value.map ( v => v.value.toString () );
}