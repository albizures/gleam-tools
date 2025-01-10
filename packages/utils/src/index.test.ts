import { expect, it } from 'vitest'
import path from 'node:path'
import { getJsFilePath, isGleamFile } from '.'

it('getJsFilePath', () => {
	const config = { name: 'my_app', version: '1.0.0', target: 'javascript' }

	expect(getJsFilePath('src/index.gleam', config)).toBe(
		path.join(process.cwd(), 'build', 'dev', 'javascript', 'my_app', 'index.mjs'),
	)
})

it('is gleam', () => {
	expect(isGleamFile('src/index.gleam')).toBe(true)
	expect(isGleamFile('src/index.ts')).toBe(false)
})
