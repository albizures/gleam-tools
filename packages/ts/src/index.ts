import process from 'node:process'
import type tsModule from 'typescript/lib/tsserverlibrary.js'
import { isGleamFile, readSyncGleamConfig } from '@gleam-tools/utils'
import { createContext } from './context'
import { decorateScriptSnapshot } from './decorators/script-snapshot'
import { decorateResolveModuleNameLiterals } from './decorators/resolve-module-name-literals'
import { decorateNavigateToItems } from './decorators/navigate-to-items'
import { decorateFileReferences } from './decorators/file-references'
import { decorateDefinitionAndBountSpan } from './decorators/definition-and-bound-span'

function safeReadGleamConfig(logger: tsModule.server.Logger) {
	try {
		return readSyncGleamConfig()
	}
	catch (error) {
		logger.info(`[ts-gleam] ERR: ${error}`)
		return undefined
	}
}

type InitArgs = {
	typescript: typeof tsModule
}

// eslint-disable-next-line no-restricted-syntax
export = function init(args: InitArgs): tsModule.server.PluginModule {
	const ts = args.typescript
	function create(info: tsModule.server.PluginCreateInfo) {
		const { logger } = info.project.projectService

		logger.info('[ts-gleam] initializing ts-gleam :) 1')

		const directory = info.project.getCurrentDirectory()
		process.chdir(directory)

		logger.info(`[ts-gleam] reading gleam.toml file ${directory}`)
		const gleamConfig = safeReadGleamConfig(logger)

		if (!gleamConfig) {
			logger.info('[ts-gleam] ERROR | gleam.toml not found')
			return info.languageService
		}

		const context = createContext(
			ts,
			info,
			gleamConfig,
		)
		const { languageService } = context

		// TODO: move this into utils
		if (
			typeof gleamConfig.javascript !== 'object'
			|| (gleamConfig.javascript).typescript_declarations !== true
		) {
			logger.info('[ts-gleam] ERROR | typescript declarations not enabled')
			return languageService
		}

		decorateScriptSnapshot(context)
		decorateResolveModuleNameLiterals(context)
		decorateNavigateToItems(context)
		decorateFileReferences(context)
		decorateFileReferences(context)
		decorateDefinitionAndBountSpan(context)

		return languageService
	}

	function getExternalFiles(
		project: tsModule.server.ConfiguredProject,
	): Array<string> {
		const { logger } = project.projectService
		logger.info('[ts-gleam] getting external files')
		return project.getFileNames().filter(isGleamFile)
	}

	return { create, getExternalFiles }
}
