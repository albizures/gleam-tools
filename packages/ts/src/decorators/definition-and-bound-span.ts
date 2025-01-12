import { isGleamFile } from '@gleam-tools/utils'
import fs from 'node:fs'
import type tsModule from 'typescript/lib/tsserverlibrary'
import type { Context } from '../context'

export function decorateDefinitionAndBountSpan(context: Context) {
	const { languageService, logger } = context
	const getDefinitionAndBoundSpan = languageService.getDefinitionAndBoundSpan.bind(
		languageService,
	)

	languageService.getDefinitionAndBoundSpan = (fileName, position) => {
		const result = getDefinitionAndBoundSpan(fileName, position)

		if (!result) {
			return
		}

		return {
			...result,
			definitions: result?.definitions?.map((def) => {
				if (!isGleamFile(def.fileName)) {
					return def
				}

				return {
					...def,
					textSpan: getTextSpan(def, logger),
					// Spare the work for now
					originalTextSpan: undefined,
					contextSpan: undefined,
					originalContextSpan: undefined,
				}
			}),
		}
	}
}

function getTextSpan(def: tsModule.DefinitionInfo, logger: tsModule.server.Logger): tsModule.TextSpan {
	const { fileName, kind, name } = def

	if (kind !== 'function') {
		logger.info(`[ts-gleam] non-function definition are not supported: ${kind}`)
		return def.textSpan
	}

	const file = fs.readFileSync(fileName, 'utf-8')

	const startGleamFn = `pub fn `
	const gleamFn = `${startGleamFn}${name}`

	const start = file.indexOf(gleamFn) + startGleamFn.length

	return {
		start,
		length: name.length,
	}
}
