import type { GleamConfig } from '@gleam-tools/utils'

import { getDeclarationFilePath } from '@gleam-tools/utils'
import fs from 'node:fs'
import type tsModule from 'typescript/lib/tsserverlibrary.js'

export function hasDeclaration(
	fileName: string,
	config: GleamConfig,
	logger: tsModule.server.Logger,
) {
	const filepath = getDeclarationFilePath(fileName, config)
	logger.info(`[ts-gleam] checking if declaration exists at "${filepath}"`)
	return fs.existsSync(filepath)
}

export function getDtsSnapshot(
	ts: typeof tsModule,
	config: GleamConfig,
	fileName: string,
	logger: tsModule.server.Logger,
): tsModule.IScriptSnapshot {
	const filePath = getDeclarationFilePath(fileName, config)

	logger.info(`[ts-gleam] loading declaration from ${filePath}`)
	const file = fs.readFileSync(filePath, { encoding: 'utf-8' })

	return ts.ScriptSnapshot.fromString(file)
}
