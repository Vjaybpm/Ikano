import { NamedUrl } from "@itsmworkbench/urlstore";
import { composeValidators, Validate, validateFieldEquals, validateFieldIsOneOf, validateFieldIsString } from "@fusionconfig/utils";

export type TransType = 'jsonata'
export interface Trans {
  version: 1
  type: TransType
  enabled?: boolean
  from: string
  to: string
  jsonata: string//later we should support non jsonata and tease this apart. That's what the type is for
}

export interface TransAndMeta {
  trans: Trans
  path: string,
  url: NamedUrl
  name: string
  id: string
}

export const validateTrans: Validate<Trans> = composeValidators (
  validateFieldIsString ( 'from' ),
  validateFieldIsString ( 'to' ),
  validateFieldEquals ( 'type', 'jsonata' ),
  validateFieldIsString ( 'jsonata' ),
  validateFieldEquals ( 'version', 1 )
)