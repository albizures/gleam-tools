import process from 'node:process'
import type { Plugin } from 'vite'
import path from 'node:path'
import MagicString from 'magic-string'
import { build, getJsFilePath, ignoreBuildFolder, readGleamConfig, readJsFile } from './utils'

type GleamConfig = {
	name: string
	version: string
	target: string
}

const buildFolder = path.join(process.cwd(), 'build', 'dev', 'javascript')

export function gleam(): Plugin {
	let gleamConfig: GleamConfig | undefined
	const plugin: Plugin = {
		name: 'gleam',
		config(config, _env) {
			ignoreBuildFolder(config)
		},
		async buildStart() {
			gleamConfig = await readGleamConfig()

			await build(gleamConfig)
		},
		async resolveId(source, importer) {
			if (!importer) {
				return
			}
			else if (source.startsWith('hex:')) {
				const id = path.join(
					buildFolder,
					source.slice(4),
				)
				return { id }
			}

			if (!importer.endsWith('.gleam') && !source.endsWith('gleam.mjs')) {
				return
			}

			importer = getJsFilePath(importer, gleamConfig!)

			const id = path.join(
				buildFolder,
				importer,
				'..',
				source,
			)

			return {
				id,
			}
		},
		async transform(content, id) {
			if (!id.endsWith('.gleam')) {
				return
			}

			const code = await readJsFile(id, gleamConfig!)

			const magicString = new MagicString(content)
			magicString.overwrite(0, content.length - 1, code)

			const map = magicString.generateMap({ source: id, includeContent: true })

			return {
				code,
				map,
			}
		},
		async handleHotUpdate(ctx) {
			if (ctx.file.endsWith('.gleam')) {
				await build(gleamConfig!)
			}
		},
	}

	return plugin
}
