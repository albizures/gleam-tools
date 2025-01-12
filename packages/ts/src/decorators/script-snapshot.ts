import { isGleamFile } from '@gleam-tools/utils'
import { getDtsSnapshot } from '../utils'
import type { Context } from '../context'

export function decorateScriptSnapshot(context: Context): void {
	const { ts, info, logger, gleamConfig, languageServiceHost } = context

	const getScriptSnapshot = info.languageServiceHost.getScriptSnapshot
	languageServiceHost.getScriptSnapshot = (fileName) => {
		if (isGleamFile(fileName)) {
			const dts = getDtsSnapshot(ts, gleamConfig, fileName, logger)
			return dts
		}
		return getScriptSnapshot(fileName)
	}
}
