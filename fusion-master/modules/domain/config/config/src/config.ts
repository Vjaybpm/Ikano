import { flatMap, NameAnd } from "@laoban/utils";

export type LoadFilesFn = ( params: NameAnd<string>, parent: string, file: string, debug?: boolean ) => Promise<FileDetails[]>

export interface LegalParameter {
  legal: string[]
}
export function isLegalParameter ( x: any ): x is LegalParameter {
  return x.legal !== undefined
}
export type Parameter = LegalParameter | {}
export interface ConfigFile {
  version: 1
  parameters: NameAnd<Parameter> // for example capacity: {legalValues: ['AML', 'creditCheck']}
  // Name is just descriptive, value is the filepath we will be loading
  //Note that we can have  parameters in the file path.
  //  - name: "Channel Specific Configuration"
  //     path: "get/${geo}/${product}/${channel}/{geo}_${product}_${channel}.yaml"
  hierarchy: NameAnd<string>

}


export type FileDetails = {
  trail: string[]
  file: string
  exists: boolean
  errors: string[]
  yaml: any | undefined
}


