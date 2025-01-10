import { describe, expect, it } from 'vitest'
import path from 'node:path'
import { getJsFilePath, ignoreBuildFolder } from './utils'
import type { UserConfig } from 'vite'

it('getJsFilePath', () => {
	const config = { name: 'my_app', version: '1.0.0', target: 'javascript' }

	expect(getJsFilePath('src/index.gleam', config)).toBe(
		path.join(process.cwd(), 'build', 'dev', 'javascript', 'my_app', 'index.mjs'),
	)
})

describe('ignoreBuildFolder', () => {
	it('no exclude', () => {
		const config: UserConfig = {}

		ignoreBuildFolder(config)

		expect(config.build).toEqual(undefined)
	})

	it('exclude is string', () => {
		const config: UserConfig = {
			build: {
				watch: {
					exclude: 'src',
				},
			},
		}

		ignoreBuildFolder(config)

		expect(config.build!.watch!.exclude).toEqual(['src', 'build/**'])
	})

	it('exclude is array', () => {
		const config: UserConfig = {
			build: {
				watch: {
					exclude: ['src'],
				},
			},
		}

		ignoreBuildFolder(config)

		expect(config.build!.watch!.exclude).toEqual(['src', 'build/**'])
	})
})
