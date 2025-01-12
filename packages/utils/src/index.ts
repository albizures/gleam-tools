import { execSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import { parse } from 'toml'

const GLEAM_REGEX = /\.gleam$/
const GLEAM_JS_REGEX = /\.m?js$/

/**
 * Assert function
 */
export function assert(condition: unknown, message: string, ...args: Array<unknown>): asserts condition {
	if (!condition) {
		if (args.length > 0) {
			console.error(message, ...args)
		}
		throw new Error(message)
	}
}

/**
 * Check if a file is a Gleam file
 */
export function isGleamFile(fileName: string): boolean {
	return GLEAM_REGEX.test(fileName)
}

export type GleamConfig = {
	name: string
	version: string
	target: string
	javascript?: {
		typescript_declarations?: boolean
	}
}

/**
 * Check if a file is a JavaScript file
 */
export function isJsFile(fileName: string): boolean {
	return GLEAM_JS_REGEX.test(fileName)
}

/**
 * Read a Gleam file and return its content
 */
export function readJsFile(gleamFilePath: string, config: GleamConfig): Promise<string> {
	const jsFilePath = getJsFilePath(gleamFilePath, config)

	return fs.readFile(jsFilePath, { encoding: 'utf8' })
}

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
 * Build the project using Gleam
 */
export async function build(config: GleamConfig): Promise<void> {
	if (!config) {
		throw new Error('gleam.toml not found')
	}

	const command = `gleam build --target=${config.target}`
	console.log(`$ ${command}`)
	const out = execSync(command, { encoding: 'utf8' })
	console.log(out)
}

/**
 * Read the Gleam configuration file
 */
export async function readGleamConfig(): Promise<GleamConfig> {
	const filePath = path.join(process.cwd(), 'gleam.toml')
	const stats = await fs.lstat(filePath)
	if (!stats.isFile()) {
		throw new Error('gleam.toml file not found')
	}
	const file = await fs.readFile(filePath, { encoding: 'utf8' })
	return parse(file) as GleamConfig
}

/**
 * Read the Gleam configuration file
 */
export function readSyncGleamConfig(): GleamConfig {
	const filePath = path.join(process.cwd(), 'gleam.toml')
	const stats = fsSync.lstatSync(filePath)
	if (!stats.isFile()) {
		throw new Error('gleam.toml file not found')
	}
	const file = fsSync.readFileSync(filePath, { encoding: 'utf8' })
	return parse(file) as GleamConfig
}

/**
 * Get the path of the declaration file generated from a Gleam file
 */
export function getDeclarationFilePath(fileName: string, config: GleamConfig): string {
	return getJsFilePath(fileName, config).replace('.mjs', '.d.mts')
}
