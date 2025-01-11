import process from 'node:process'
import path from 'node:path'
import { getDeclarationFilePath, getJsFilePath, isGleamFile, readSyncGleamConfig } from '@gleam-tools/utils'
import type tsModule from 'typescript/lib/tsserverlibrary.js'
import { getDtsSnapshot, hasDeclaration } from './utils'

function safeReadGleamConfig(logger: tsModule.server.Logger) {
	try {
		return readSyncGleamConfig()
	}
	catch (error) {
		logger.info(`[ts-gleam] ERR: ${error}`)
		return undefined
	}
}

// eslint-disable-next-line no-restricted-syntax
export = function init(modules: {
	typescript: typeof tsModule
}) {
	const ts = modules.typescript
	function create(info: tsModule.server.PluginCreateInfo) {
		const { logger } = info.project.projectService

		logger.info('[ts-gleam] initializing ts-gleam')

		const directory = info.project.getCurrentDirectory()
		process.chdir(directory)

		const languageServiceHost: Partial<tsModule.LanguageServiceHost> = {}
		const languageServiceHostProxy = new Proxy(info.languageServiceHost, {
			get(target, key: keyof tsModule.LanguageServiceHost) {
				return languageServiceHost[key]
					? languageServiceHost[key]
					: target[key]
			},
		})

		const languageService = ts.createLanguageService(languageServiceHostProxy)

		logger.info('[ts-gleam] reading gleam.toml file')
		const gleamConfig = safeReadGleamConfig(logger)

		if (!gleamConfig) {
			logger.info('[ts-gleam] ERROR | gleam.toml not found')
			return languageService
		}

		if (
			typeof gleamConfig.javascript !== 'object'
			|| (gleamConfig.javascript).typescript_declarations !== true
		) {
			logger.info('[ts-gleam] ERROR | typescript declarations not enabled')
			return languageService
		}

		languageServiceHost.getScriptKind = (fileName) => {
			if (!info.languageServiceHost.getScriptKind) {
				return ts.ScriptKind.Unknown
			}

			if (
				isGleamFile(fileName)
				&& hasDeclaration(fileName, gleamConfig, logger)
			) {
				return ts.ScriptKind.TS
			}
			return info.languageServiceHost.getScriptKind(fileName)
		}

		languageServiceHost.getScriptSnapshot = (fileName) => {
			if (
				isGleamFile(fileName)
				&& hasDeclaration(fileName, gleamConfig, logger)
			) {
				const dts = getDtsSnapshot(ts, gleamConfig, fileName, logger)
				return dts
			}
			return info.languageServiceHost.getScriptSnapshot(fileName)
		}

		function createModuleResolver(containingFile: string) {
			return (
				moduleName: tsModule.StringLiteralLike,
				_resolveModule: () =>
					| tsModule.ResolvedModuleWithFailedLookupLocations
					| undefined,
			): tsModule.ResolvedModuleFull | undefined => {
				if (isGleamFile(moduleName.text)) {
					const p = path.resolve(path.dirname(containingFile), moduleName.text)

					return {
						extension: ts.Extension.Dts,
						isExternalLibraryImport: false,
						resolvedFileName: path.join(process.cwd(), getDeclarationFilePath(p, gleamConfig!)),
					}
				}
			}
		}

		if (info.languageServiceHost.resolveModuleNameLiterals) {
			const resolveModuleNameLiterals = info.languageServiceHost.resolveModuleNameLiterals!.bind(
				info.languageServiceHost,
			)
			languageServiceHost.resolveModuleNameLiterals = (
				modulesLiterals,
				containingFile,
				...rest
			) => {
				const resolvedModules = resolveModuleNameLiterals(
					modulesLiterals,
					containingFile,
					...rest,
				)

				const moduleResolver = createModuleResolver(containingFile)

				return modulesLiterals.map((moduleName, index) => {
					try {
						const resolvedModule = moduleResolver(
							moduleName,
							() =>
								languageServiceHost.getResolvedModuleWithFailedLookupLocationsFromCache?.(
									moduleName.text,
									containingFile,
								),
						)
						if (resolvedModule) {
							return { resolvedModule }
						}
					}
					catch (error) {
						logger.info(`[ts-gleam] ERR: ${error}`)
						return resolvedModules[index]
					}
					return resolvedModules[index]
				})
			}
		}

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
