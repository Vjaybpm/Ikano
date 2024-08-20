import { ContextAndStats, defaultShowsError, KoaPartialFunction, notFoundIs404 } from "@itsmworkbench/koa";
import { NameSpaceDetails, UrlStore } from "@itsmworkbench/urlstore";
import { NameAnd } from "@laoban/utils";
import { getUrls, listUrls, putUrls } from "@itsmworkbench/apiurlstore";
import { chainOfResponsibility } from "@runbook/utils";
import { getFusion, matchFusion, matchRawFusion } from "./api.for.fusion";
import { CommentFunction, LoadFilesFn } from "@fusionconfig/config";
import { PostProcessor } from "@fusionconfig/config";
import { callService, matchService } from "./api.for.call.service";
import { FileOps } from "@laoban/fileops";
import { getAxes, matchAxes } from "./api.for.axes";
import { getFolders } from "@itsmworkbench/apiurlstore/dist/src/api.for.url.store";
import { YamlCapability } from "@itsmworkbench/yaml";
import { runTests } from "@fusionconfig/apitests/src/tests.api";
import { RunReqRespTests, RunTests } from "@fusionconfig/tests";


export const fusionHandlers = (
  configFileName: string,
  urlStore: UrlStore,
  fileOps: FileOps,
  loadFile: LoadFilesFn,
  postProcessors: PostProcessor[],
  yaml: YamlCapability,
  commentFn: CommentFunction,
  rt: RunReqRespTests,
  parent: string,
  debug: boolean | undefined,
  ...handlers: KoaPartialFunction[] ): ( from: ContextAndStats ) => Promise<void> =>
  chainOfResponsibility ( defaultShowsError, //called if no matches
    getAxes ( fileOps, yaml, configFileName ),
    getFolders ( urlStore.folders ),
    listUrls ( urlStore.list ),
    getUrls ( urlStore ),
    getFusion ( matchRawFusion, loadFile, [], commentFn, parent, debug ),
    getFusion ( matchFusion, loadFile, postProcessors, commentFn, parent, debug ),
    callService ( matchService, fileOps, urlStore, debug ),
    runTests ( rt, debug ),
    ...handlers,
    notFoundIs404,
  )