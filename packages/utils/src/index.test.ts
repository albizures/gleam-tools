import { describe, expect, it } from 'vitest'
import path from 'node:path'
import { getJsFilePath, isGleamFile } from '.'

describe('getJsFilePath', () => {
	it('should return the correct path', () => {
		const config = { name: 'my_app', version: '1.0.0', target: 'javascript' }

		const expected = path.join(process.cwd(), 'build', 'dev', 'javascript', 'my_app', 'index.mjs')
		const actual = getJsFilePath(path.join(process.cwd(), '/src/index.gleam'), config)
		expect(actual).toBe(expected)
	})

	describe('when the file is in a subfolder', () => {
		it('should return the correct path', () => {
			const config = { name: 'my_app', version: '1.0.0', target: 'javascript' }

			const expected = path.join(process.cwd(), 'build', 'dev', 'javascript', 'my_app', 'subfolder', 'index.mjs')
			const actual = getJsFilePath(path.join(process.cwd(), '/src/subfolder/index.gleam'), config)
			expect(actual).toBe(expected)
		})
	})

	describe('when the file is not in the src folder', () => {
		it('should return the correct path', () => {
			const config = { name: 'my_app', version: '1.0.0', target: 'javascript' }

			expect(() => getJsFilePath(path.join(process.cwd(), '/src2/index.gleam'), config)).toThrowError('Not in the src folder: ')
		})
	})

	describe('when the file is not a Gleam file', () => {
		it('should throw an error', () => {
			const config = { name: 'my_app', version: '1.0.0', target: 'javascript' }

			expect(() => getJsFilePath(path.join(process.cwd(), '/src/index.ts'), config)).toThrowError('Not a Gleam file: ')
		})
	})

	describe('when the giive path is not absolute', () => {
		it('should throw an error', () => {
			const config = { name: 'my_app', version: '1.0.0', target: 'javascript' }

			expect(() => getJsFilePath('src/index.gleam', config)).toThrowError('Not in the src folder: ')
		})
	})
})

it('is gleam', () => {
	expect(isGleamFile('src/index.gleam')).toBe(true)
	expect(isGleamFile('src/index.ts')).toBe(false)
})
