import { describe, expect, it } from 'vitest'
import path from 'node:path'
import { ignoreBuildFolder } from './utils'
import type { UserConfig } from 'vite'

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
