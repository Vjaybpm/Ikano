import React, { useState } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";

import { hasErrors } from "@laoban/utils";
import { LensProps } from "@focuson/state";
import { Button } from "@mui/material";

export interface JsonEditorProps {
  json: string | undefined
  Suggest?: ( setJson: ( json: string ) => void ) => React.ReactNode
  Save: ( json: string | string[] | undefined ) => React.ReactNode | undefined
  height?: string
}
export interface JsonEditorInStateProps<S> extends LensProps<S, string, any> {
  Suggest?: ( setJson: ( json: string ) => void ) => React.ReactNode
  height?: string
}

export function JsonEditorInState<S> ( { height, Suggest, state }: JsonEditorInStateProps<S> ) {
  return <JsonEditor json={state.optJson ()} height={height} Suggest={Suggest}
                     Save={json => <Button>Save</Button>}/>
}

export function JsonEditor ( { Save, height, Suggest, json }: JsonEditorProps ) {
  const [ jsonContent, setJsonContent ] = useState<string | undefined> ( json );
  const jsonString = hasErrors ( jsonContent ) ? 'Errors\n' + jsonContent.join ( '\n' ) : jsonContent
  const monaco = useMonaco (); // needed to initialise
  return <>
    <Editor
      height={height || '300px'}
      language="json"
      defaultValue={jsonString}
      options={{
        renderValidationDecorations: 'on',
        minimap: { enabled: false },
      }}
      onChange={e => {
        setJsonContent ( e );
      }}
    />
    {Suggest && Suggest ( setJsonContent )}
    {Save ( jsonContent )}
  </>
}