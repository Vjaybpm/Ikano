import React from "react";
import { MenuItem, Select } from "@mui/material";
import { LensProps, LensProps2 } from "@focuson/state";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { NameAnd, safeArray } from "@laoban/utils";

export type SelectWhenIdIsNameProps<S> = {
  selected: string | undefined
  onClick?: ( key: string ) => void
  name: string
  options: string[] // In this case the id is the name
}
export function SelectWhenIdIsName<S> ( { selected, onClick, name, options }: SelectWhenIdIsNameProps<S> ) {
  return <Select
    value={selected || ''}
    onChange={e => onClick && onClick ( e.target?.value )}
    aria-label={`Select ${name ? ' ' + name : ''}`}
    displayEmpty
    fullWidth
  ><MenuItem disabled value=""> <em>Please select a {name}</em> </MenuItem>
    {options.map ( ( option ) => (
      <MenuItem key={option} value={option}>{splitAndCapitalize ( option )}</MenuItem>
    ) )}</Select>
}
export type SingleSelectWithOptionsProps<S, T> = LensProps<S, T, any> & {
  name: string
  options: T[]
}

export function SingleSelectWithOptions<S, T extends any> ( { name, state, options }: SingleSelectWithOptionsProps<S, T> ) {
  const selected = state.optJson ()
  try {
    return <Select
      value={selected?.toString () || ''}
      onChange={e => state.setJson ( e.target?.value as T, 'Selectit' )}
      aria-label={`Select`}
      displayEmpty
      fullWidth
    ><MenuItem disabled value=""> <em>Please select a {name}</em> </MenuItem>
      {safeArray ( options ).map ( ( option ) => {
        const opt = `${option}`
        return (
          <MenuItem key={opt} value={opt}>{splitAndCapitalize ( opt )}</MenuItem>
        );
      } )}
    </Select>
  } catch ( e: any ) {
    return <div>Error: {e}</div>
  }
}
export type SingleSelectProps<S> = LensProps2<S, string[], string, any> & {
  name: string
}
export function SingleSelect<S> ( { name, state }: SingleSelectProps<S> ) {
  const options = state.optJson1 () || []
  return <SingleSelectWithOptions state={state.state2 ()} name={name} options={options}/>
}

export type MultipleSelectProps<S> = LensProps2<S, NameAnd<string[]>, NameAnd<string>, any>
export function MultipleSelects<S> ( { state }: MultipleSelectProps<S> ) {
  const keys = Object.keys ( state.optJson1 () || {} )
  return <>{keys.map ( key => <SingleSelect state={state.focus1On ( key ).focus2On ( key )} name={key}/> )}</>
}