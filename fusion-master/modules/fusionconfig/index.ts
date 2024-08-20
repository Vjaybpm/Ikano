#!/usr/bin/env node
import { makeCli, SubCommandDetails } from "@itsmworkbench/cli";
import { Commander12 } from "@itsmworkbench/commander12";
import { hasErrors, reportErrors } from "@laoban/utils";
import { configCommands } from "./src/config.commands";
import { cliTc, configFinder, makeContext, ThereAndBackContext } from "./src/context";
import { apiCommand } from "@fusionconfig/api";
import { transformerCommands } from "./src/transformer.commands";
import { transformNs } from "@fusionconfig/transformer";
import { schemaCommands } from "./src/schema.commands";
import { testCommands } from "@fusionconfig/clitests";

export function findVersion () {
  let packageJsonFileName = "../package.json";
  try {
    return require ( packageJsonFileName ).version
  } catch ( e ) {
    return "version not known"
  }
}

export type NoConfig = {}

const context = makeContext ( findVersion () );
makeCli<Commander12, ThereAndBackContext, NoConfig, NoConfig> ( context, configFinder, cliTc ).then ( async ( commander ) => {
  if ( hasErrors ( commander ) ) {
    reportErrors ( commander )
    process.exit ( 1 )
  }
  cliTc.addSubCommand ( commander, configCommands ( commander ) )
  cliTc.addSubCommand ( commander, transformerCommands ( commander, transformNs ( context.yaml ) ) )
  cliTc.addSubCommand ( commander, schemaCommands ( commander, transformNs ( context.yaml ) ) )
  cliTc.addSubCommand ( commander, testCommands ( commander ) )
  cliTc.addCommands ( commander, [ apiCommand () ] )
  return await cliTc.execute ( commander.commander, context.args )
} )