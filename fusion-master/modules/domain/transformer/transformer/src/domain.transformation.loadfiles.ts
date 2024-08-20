import { putIntoFromToMap, removeLastExtension } from "@fusionconfig/utils";
import { collect, ErrorsAnd, flatMap, flatMapErrors, hasErrors, NameAnd } from "@laoban/utils";
import { Trans, TransAndMeta } from "./domain.transform";
import { NamedLoadResult, NamedUrl, parseNamedUrlOrErrors, UrlLoadNamedFn } from "@itsmworkbench/urlstore";


interface NamedLoadResultAndPathAndUrl<T> {
  path: string
  url: NamedUrl
  result: Required<NamedLoadResult<T>>
}

export interface TransMapAndErrors {
  mapped: NameAnd<NameAnd<TransAndMeta>>
  errors: string[]
}

export type PathToErrorsAndNamedUrl = ( path: string ) => ErrorsAnd<NamedUrl>
export const defaultPathToUrl = ( org: string ): PathToErrorsAndNamedUrl =>
  ( path: string ) => parseNamedUrlOrErrors ( `itsm/${removeLastExtension ( path )}` );
export async function loadAndMapTrans ( load: UrlLoadNamedFn,
                                        paths: string[],
                                        validate: ( context: string, trans: Trans ) => string[],
                                        pathToUrl: ( path: string ) => ErrorsAnd<NamedUrl> ): Promise<TransMapAndErrors> {
  const loadResult: ErrorsAnd<NamedLoadResultAndPathAndUrl<Trans>>[] = await Promise.all ( paths.map ( async path => {
    const url = pathToUrl ( path )
    if ( hasErrors ( url ) ) return url.map ( e => `Loading transformer ${path} - ${e}` )
    return flatMapErrors ( await load<Trans> ( url ), result => {
      const errors = validate ( `loading transformer at ${url.url}`, result.result )
      if ( errors.length > 0 ) return errors
      return ({ path, url, result });
    } );
  } ) )
  const errors = flatMap ( loadResult, lr => hasErrors ( lr ) ? lr : [] )
  const lrs: NamedLoadResultAndPathAndUrl<Trans>[] = collect ( loadResult, lr => !hasErrors ( lr ),
    lr => lr as NamedLoadResultAndPathAndUrl<Trans> )
  const metaAndTrans: TransAndMeta[] = lrs.map ( lr => ({
    url: lr.url,
    path: lr.path,
    trans: lr.result.result,
    id: lr.result.id,
    name: lr.result.url
  }) )
  const mapped = putIntoFromToMap ( metaAndTrans, mt => mt.trans.from, mt => mt.trans.to )
  return { mapped, errors }
}