import React from "react";
import { Editor, useMonaco } from "@monaco-editor/react";
import { LensProps } from "@focuson/state";

export interface JsonEditorInStateProps2<S> extends LensProps<S, string, any> {
  // Suggest?: ( setJson: ( json: string ) => void ) => React.ReactNode
  height?: string
  language: string
  validate?: string
}


export function JsonEditor2<S> ( { height, state, language, validate }: JsonEditorInStateProps2<S> ) {
  const json = state.optJson () || ''
  const monaco = useMonaco (); // needed to initialise
  return <>
    <Editor
      height={height || '300px'}
      language={language}
      value={json}
      options={{
        renderValidationDecorations: validate ? validate : 'on',
        minimap: { enabled: false },
      }}
      onChange={e => {
        state.setJson ( e || '', '' )
      }}
    />
  </>
}