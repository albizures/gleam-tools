import { execSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import fs from 'node:fs/promises'
import { parse } from 'toml'
import type { UserConfig } from 'vite'

type GleamConfig = {
	name: string
	version: string
	target: string
}

const buildFolder = path.join(process.cwd(), 'build', 'dev', 'javascript')

export function readJsFile(gleamFilePath: string, config: GleamConfig): Promise<string> {
	const jsFilePath = getJsFilePath(gleamFilePath, config)

	return fs.readFile(jsFilePath, { encoding: 'utf8' })
}

export function getJsFilePath(gleamFile: string, config: GleamConfig): string {
	let filePath = path.relative(path.resolve('.'), gleamFile.replace('.gleam', '.mjs'))
	if (filePath.startsWith('src')) {
		filePath = filePath.replace('src', config.name)
	}

	return path.join(buildFolder, filePath)
}

export async function build(config: GleamConfig) {
	if (!config) {
		throw new Error('gleam.toml not found')
	}

	console.log('$ gleam build --target=javascript')
	const out = execSync('gleam build --target=javascript', { encoding: 'utf8' })
	console.log(out)
}

export async function ignoreBuildFolder(config: UserConfig) {
	// if there is not watch config, let's not add the build folder
	if (!config.build?.watch) {
		return
	}

	const current = config.build.watch.exclude

	let origin: Array<string | RegExp> = []

	if (Array.isArray(current)) {
		origin.push(...current)
	}
	else if (current) {
		origin.push(current)
	}

	origin.push('build/**')
	config.build.watch.exclude = origin
}

export async function readGleamConfig(): Promise<GleamConfig> {
	const filePath = path.join(process.cwd(), 'gleam.toml')
	const stats = await fs.lstat(filePath)
	if (!stats.isFile()) {
		throw new Error('gleam.toml not found')
	}
	const file = await fs.readFile(filePath, { encoding: 'utf8' })
	return parse(file) as GleamConfig
}
