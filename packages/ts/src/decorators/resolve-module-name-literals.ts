import path from 'node:path'

import { isGleamFile } from '@gleam-tools/utils'
import type { Context } from '../context'
import type tsModule from 'typescript/lib/tsserverlibrary'

export function decorateResolveModuleNameLiterals(context: Context) {
	const { languageServiceHost, logger, info } = context

	if (!info.languageServiceHost.resolveModuleNameLiterals) {
		return
	}

	const resolveModuleNameLiterals = info.languageServiceHost.resolveModuleNameLiterals.bind(
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

		const moduleResolver = createModuleResolver(containingFile, context)

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

function createModuleResolver(containingFile: string, context: Context) {
	const { logger } = context
	return (
		moduleName: tsModule.StringLiteralLike,
		_resolveModule: () =>
			| tsModule.ResolvedModuleWithFailedLookupLocations
			| undefined,
	): tsModule.ResolvedModuleFull | undefined => {
		if (isGleamFile(moduleName.text)) {
			const p = path.resolve(path.dirname(containingFile), moduleName.text)

			logger.info(`[ts-gleam] resolving module "${moduleName.text}" ${p}`)
			return {
				extension: '.gleam',
				isExternalLibraryImport: false,
				resolvedFileName: p,
			}
		}
	}
}
