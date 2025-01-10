import { defineConfig } from 'vite'
import { gleam } from '@gleam-tools/vite'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
	plugins: [gleam(), Inspect()],
	build: { sourcemap: true },
})
