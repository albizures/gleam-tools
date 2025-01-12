import type { GleamConfig } from '@gleam-tools/utils'
import process from 'node:process'
import path from 'node:path'
import { assert, isGleamFile } from '@gleam-tools/utils'
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

/// extra

const GLEAM_REGEX = /\.gleam$/

/**
 * Get the path of the JavaScript file generated from a Gleam file
 */
export function getJsFilePath(gleamFile: string, config: GleamConfig): string {
	const buildFolder = path.join(process.cwd(), 'build', 'dev', 'javascript')
	const srcFolder = path.join(process.cwd(), 'src')
	const srcFolderPath = `${srcFolder}${path.sep}`

	assert(isGleamFile(gleamFile), 'Not a Gleam file: ', gleamFile)
	assert(gleamFile.startsWith(srcFolderPath), 'Not in the src folder: ', gleamFile)

	return gleamFile
		.replace(GLEAM_REGEX, '.mjs')
		.replace(
			srcFolderPath,
			`${path.join(buildFolder, config.name)}${path.sep}`,
		)
}

/**
 * Get the path of the declaration file generated from a Gleam file
 */
export function getDeclarationFilePath(fileName: string, config: GleamConfig): string {
	return getJsFilePath(fileName, config).replace('.mjs', '.d.mts')
}

export function readJsFile(gleamFilePath: string, config: GleamConfig): string {
	const jsFilePath = getJsFilePath(gleamFilePath, config)

	return fs.readFileSync(jsFilePath, { encoding: 'utf8' })
}
