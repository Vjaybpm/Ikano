import { Button, ButtonProps } from "@mui/material";
import React from "react";

export type HideNavButtonProps = ButtonProps & {
  title: string
  hidden?: boolean
  children: React.ReactNode
}
export function HideNavButton ( { title, children, hidden, ...rest }: HideNavButtonProps ) {
  const [ getHidden, setGetHidden ] = React.useState ( hidden )
  return <><Button variant='contained' {...rest} onClick={() => setGetHidden ( !getHidden )}>{title}</Button>{getHidden ? null : children}</>
}