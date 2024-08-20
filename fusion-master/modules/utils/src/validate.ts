import { flatMap } from "@laoban/utils";

export type Validate<T> = ( context: string, t: T ) => string[];
export const validateExists = <T, K extends keyof T> ( key: K ): Validate<T> =>
  ( context, t ) =>
    t?.[ key ] === undefined || t?.[ key ] === null ?
      [ `${context}: Property '${String ( key )}' does not exist.` ]
      : [];
export const validateChild = <T, K extends keyof T> ( key: K, validate: Validate<T[ K ]> ): Validate<T> =>
  ( context, t ) => validate ( `${context}.${key.toString ()}`, t[ key ] as T[ K ] );

export const validateif = <T> ( check: ( t: T ) => boolean, msg: string ): Validate<T> =>
  ( context: string, t: T, ): string[] =>
    check ( t ) ? [] : [ `${context}: ${msg}` ]

export const validateFieldIsString = <T, K extends keyof T> ( key: K ): Validate<T> =>
  validateif ( ( t: T ) => typeof t[ key ] === 'string', `Property '${String ( key )}' is not a string.` )
export const validateFieldIsOneOf = <T, K extends keyof T> ( key: K, values: T[K][] ): Validate<T> =>
  validateif ( ( t: T ) => values.includes ( t[ key ] ), `Property '${String ( key )}' is not one of ${values.join ( ', ' )}.` )

export const validateFieldEquals = <T, K extends keyof T> ( key: K, value: T[ K ] ): Validate<T> =>
  validateif ( ( t: T ) => t[ key ] === value, `Property '${String ( key )}' is not equal to ${value}.` )
export const validateIfNot = <T> ( check: ( t: T ) => boolean, msg: string ): Validate<T> =>
  ( context: string, t: T, ): string[] =>
    check ( t ) ? [ `${context}: ${msg}` ] : []

export const composeValidators = <T> ( ...validators: Validate<T>[] ): Validate<T> =>
  ( context, t ) =>
    flatMap ( validators, ( validator ) => validator ( context, t ) );